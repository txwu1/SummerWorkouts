class Workout{
    constructor(workoutType, date, time, description, lastEdited, completed=false){
        this.workoutType = workoutType;
        this.date = date;
        this.time = time;
        this.description = description;
        this.lastEdited = lastEdited;
        this.completed = completed;
    }

    get toJSON(){
        return {
            workoutType: this.workoutType,
            date: this.date,
            time: this.time,
            description: this.description,
            lastEdited: this.lastEdited,
            completed: completed
        }
    }
}

export { Workout };