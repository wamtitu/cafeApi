export class Reservation {
    constructor(startDateTime, durationMinutes) {
        this.startDateTime = new Date(startDateTime);
        this.endDateTime = new Date(this.startDateTime.getTime() + durationMinutes * 60000); // Convert duration to milliseconds
    }
}

export function combineDateTime(dateInput, timeInput) {
    //  * Combine date and time inputs to create a complete date-time string.
    return `${dateInput}T${timeInput}:00`;
}

export function isAvailable(resourceReservations, newStartDateTime) {
    const fixedDurationMinutes = 45;
    const newEndDateTime = new Date(new Date(newStartDateTime).getTime() + fixedDurationMinutes * 60000);

    

    for (const reservation of resourceReservations) {
        // Parse existing reservation times as strings to create Date objects
        const existingStartDateTime = new Date(reservation.startDateTime);
        const existingEndDateTime = new Date(reservation.endDateTime);

        

        if (
            newStartDateTime < existingEndDateTime &&
            newEndDateTime > existingStartDateTime
        ) {
            
            return false; // Resource is not available due to overlap
        }
    }

    console.log("No overlap");
    return true; // Resource is available
}

