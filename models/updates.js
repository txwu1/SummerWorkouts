class Update{
    constructor(date, description, lastEdited){
        this.date = date;
        this.description = description;
        this.lastEdited = lastEdited;
    }

    get toJSON(){
        return {
            date: this.date,
            description: this.description,
            lastEdited: this.lastEdited
        }
    }
}

class UpdateGetter{
    constructor(id, data){
        this.id = id;
        this.postType = "UPDATE";
        this.data = data;
    }
}

module.exports =    {
                        Update: Update,
                        UpdateGetter: UpdateGetter
                    }