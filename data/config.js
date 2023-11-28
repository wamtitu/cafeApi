
const config ={
    port: 5000,
    sql:{
        user: "Admin1",
        password: "Coffeeshop1",
        server: "coffeeshop.database.windows.net",
        database: "coffee",
        options: {
            encryt: true,
            trustServerCertificate:false
        }

    },
    jwt_secret: JWT_SECRET
}
export default config;