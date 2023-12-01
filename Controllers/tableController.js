import sql from 'mssql';
import config from '../data/config.js';
import nodemailer from 'nodemailer';
import { isAvailable, combineDateTime, Reservation } from '../Library/Overlap.js';


const pool = new sql.ConnectionPool(config.sql);
await pool.connect();

//getting all reservations
export const getAllReservations = async (req, res) => {
  try {
    let pool = await sql.connect(config.sql);
    const persons = await pool.request()
    .query("SELECT * FROM Reservation");
    res.status(200).json(persons.recordset);
  } catch (error) {
    res.status(201).json( error);
  } finally {
    sql.close();
  }
};

const checkReservationIdExists = async (reservation_id) => {
  // returns true if a number exists and false if it doesn't
  try {
    const user = await pool
      .request()
      .input("reservation_id", sql.Int, reservation_id)
      .query("SELECT * FROM Reservation WHERE reservation_id = @reservation_id");
    console.log(user.recordset);
    if (user.recordset.length == 0) {
      return false;
    } else {
      return true;
    }
  } finally {
    sql.close();
  }
};

console.log(await checkReservationIdExists("1"));



//creating a new reservation
export const createReservation = async (req, res) => {
  try {
      const { reservation_id, name, date, tableNumber, time, numberOfPeople, contact, email } = req.body;

      // Combine date and time to create a complete date-time string
      const newStartDateTime = new Date(combineDateTime(date, time));
      const existingReservations = [];

      const reservations = await pool.request()
      .input('tableNumber', sql.VarChar, tableNumber)
      .query("select * from Reservation where tableNumber=@tableNumber");

      console.log(reservations);
      reservations.recordset.forEach(reservation => {
        if (reservation.reservation_date instanceof Date) {
          const dateISOString = reservation.reservation_date.toISOString();
          const dateTimeString = `${dateISOString.split('T')[0]}T${reservation.reservation_time}`;
      
          const startDateTime = new Date(dateTimeString);
      
          // Check if the Date object is valid
          if (!isNaN(startDateTime.getTime())) {
            const durationMinutes = 45; // Set the duration according to your logic
      
            existingReservations.push({
              startDateTime,
              endDateTime: new Date(startDateTime.getTime() + durationMinutes * 60000),
            });
          } else {
            console.error(`Invalid date or time for reservation_id ${reservation.reservation_id}`);
          }
        } else {
          console.error(`Invalid type for reservation_date in reservation_id ${reservation.reservation_id}`);
        }
      });
      
      console.log(existingReservations);
      // Mock existing reservations (you should replace this with actual data from your database)

      // Check if the new reservation overlaps with existing reservations
      // Check if the new reservation overlaps with existing reservations
    if (!isAvailable(existingReservations, newStartDateTime)) {
        console.log("overlap")
      return res.status(401).json({ message: 'Reservation overlaps with an existing booking.' });
    }


      // If not overlapping, proceed to insert into the database
      await pool
          .request()
          .input('username', sql.VarChar, name)
          .input('email', sql.VarChar, email)
          .input('reservation_date', sql.Date, date)
          .input('tableNumber', sql.VarChar, tableNumber)
          .input('reservation_time', sql.VarChar, time)
          .input('No_of_people', sql.Int, numberOfPeople)
          .input('tel', sql.VarChar, contact)
          .query(
              'INSERT INTO Reservation(username,email, reservation_date, tableNumber, reservation_time, no_of_people, tel) VALUES (@username,@email, @reservation_date, @tableNumber, @reservation_time, @No_of_people, @tel)'
          );

      // Send the email to the user
      const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: 'wamtitujose@gmail.com',
              pass: 'oaeg kpjr eukl rfme',
          },
      });

      const mailOptions = {
          from: 'wamtitujose@gmail.com',
          to: email,
          subject: 'Reservation Confirmation',
          html: `<h2> Hello ${name}</h2>
              <h3>confirm your reservation</h3>
              <p>Table Number: ${tableNumber}</p>
              <p>Date: ${date}</p>
              <p>Time: ${time}</p>
              <img src="https://images.pexels.com/photos/4722998/pexels-photo-4722998.jpeg?auto=compress&cs=tinysrgb&w=600" />
              <h3>thanks for the booking</h3>`
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.log('Error sending email:', error);
          } else {
              console.log('Email sent:', info.response);
          }
      });

      res.status(200).json({ message: 'Reservation made successfully' });
  } catch (error) {
      console.error('Error creating reservation:', error);
      res.status(500).json({ message: 'Internal server error.' });
  } finally {
      // Ensure you have the appropriate cleanup code here
      sql.close();
  }
};

//get a reservation
export const getReservation = async (req, res) => {
    try {
        const { reservation_id ,username} = req.params;
        let pool = await sql.connect(config.sql)
        const result = await pool.request()
            .input('reservation_id', sql.Int, reservation_id)
            .input('username', sql.VarChar, username)
            .query("select * from Reservation where username =@username")
        res.status(200).json(result)
    } catch (error) {
        res.status(400).json(error);
    } finally {
        sql.close()
    }

}

// update a reservation details
export const updateReservation = async (req, res) => {
    try {
        const { reservation_id, name,tableNumber,time,date } = req.params;
        let pool = await sql.connect(config.sql)
         await pool.request()
            .input('reservation_id', sql.Int, reservation_id)
            .input('username', sql.VarChar, name)
            .input('tableNumber', sql.VarChar, tableNumber)
            .input('reservation_time', sql.Time, time)
            .input('reservation_date', sql.Date, date)
            .query("update Reservation set username=@username, tableNumber=@tableNumber, reservation_time=@reservation_time, reservation_date=@reservation_date where reservation_id=@reservation_id")
        res.status(200).json({ message: 'reservation updated successfully' })
    } catch (error) {
        res.status(200).json(error);

    }finally{
        sql.close()
    }
}

//delete  Reservation
export const deleteReservation = async (req, res) => {
    try {
        const {  name } = req.params;
        let pool = await sql.connect(config.sql)
        await pool.request()         
            .query(`delete from Reservation where username=${name}`)
        res.status(200).json({ message: 'reservation deleted successfully' })
    } catch (error) {
        res.status(200).json(error);

    }finally{
        sql.close()
    }
}