import sql from 'mssql';
import config from '../data/config.js';

const pool = new sql.ConnectionPool(config.sql);
await pool.connect();

export const getAvailableTables = async (req, res) => {
    try {
        const result = await pool.request()
        .query('SELECT tableId, tableNumber, name, description, images FROM reserve;');
    //   const tableNumbers = []
    //  result.recordset.forEach(table=>{
    //   tableNumbers.push({tableNumber: table.tableNumber});
    //  })
    const data = result.recordset;
    res.json({data})
        // Send the available tables as the response
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while fetching available tables.' });
      } finally {
        // Close the SQL connection pool
        sql.close();
      }
  };
  export const addTable = async (req, res) => {
 

    try {
      const {name, description, images, tableNumber} = req.body;
     
  
      await pool
        .request()
        .input('name', sql.VarChar, name)
        .input('description', sql.VarChar, description)
        .input('images', sql.VarChar, images)
        .input('tableNumber', sql.VarChar, tableNumber)
        .query(
          'INSERT INTO reserve(name, description, images, tableNumber) VALUES (@name, @description, @images, @tableNumber)'
        );
    }
        catch (error) {
          res.status(400).json({ message: error.message });
        } finally {
          sql.close();
        }
    };