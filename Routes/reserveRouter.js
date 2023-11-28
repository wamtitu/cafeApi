
import { loginRequired } from "../Controllers/UserController.js";
import { getAvailableTables, addTable } from "../Controllers/reserveController.js"


const routes = (app) => {
    //people routes
    app.route('/available-tables')
        .get( getAvailableTables)
    app.route('/add-table')
        .post( addTable)
}

export default routes;