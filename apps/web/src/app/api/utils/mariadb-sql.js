// MariaDB/MySQL connection utility
// This is a replacement for the PostgreSQL sql utility

const createSqlFunction = () => {
  let pool = null;
  
  const initPool = async () => {
    if (pool) return pool;
    
    try {
      const mysql = await import('mysql2/promise');
      pool = mysql.default.createPool({
        host: process.env.DATABASE_HOST || 'localhost',
        port: process.env.DATABASE_PORT || 3306,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        // Handle connection string if provided
        ...(process.env.DATABASE_URL && {
          uri: process.env.DATABASE_URL
        })
      });
      return pool;
    } catch (error) {
      throw new Error('mysql2 package is required for MariaDB support. Please install it with: npm install mysql2');
    }
  };
  
  const sql = async (strings, ...values) => {
    try {
      const pool = await initPool();
      
      // Handle template literal syntax
      if (Array.isArray(strings)) {
        let query = strings[0];
        const params = [];
        
        for (let i = 0; i < values.length; i++) {
          query += '?' + strings[i + 1];
          params.push(values[i]);
        }
        
        const [rows] = await pool.execute(query, params);
        return rows;
      } else {
        // Handle regular query string
        const [rows] = await pool.execute(strings, values);
        return rows;
      }
    } catch (error) {
      console.error('SQL Error:', error);
      throw error;
    }
  };

  // Add transaction support
  sql.transaction = async (queries) => {
    const pool = await initPool();
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const results = [];
      for (const queryItem of queries) {
        if (typeof queryItem === 'function') {
          // Handle function-based queries
          const txSql = async (strings, ...values) => {
            if (Array.isArray(strings)) {
              let query = strings[0];
              const params = [];
              
              for (let i = 0; i < values.length; i++) {
                query += '?' + strings[i + 1];
                params.push(values[i]);
              }
              
              const [rows] = await connection.execute(query, params);
              return rows;
            } else {
              const [rows] = await connection.execute(strings, values);
              return rows;
            }
          };
          const result = await queryItem(txSql);
          results.push(result);
        } else {
          // Handle direct SQL queries
          const [rows] = await connection.execute(queryItem);
          results.push(rows);
        }
      }
      
      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };

  return sql;
};

const NullishQueryFunction = () => {
  throw new Error(
    'No database connection details were provided. Please set DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD, and DATABASE_NAME environment variables, or provide DATABASE_URL'
  );
};
NullishQueryFunction.transaction = () => {
  throw new Error(
    'No database connection details were provided. Please set DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD, and DATABASE_NAME environment variables, or provide DATABASE_URL'
  );
};

const sql = (process.env.DATABASE_URL || (process.env.DATABASE_HOST && process.env.DATABASE_USER)) 
  ? createSqlFunction() 
  : NullishQueryFunction;

export default sql;