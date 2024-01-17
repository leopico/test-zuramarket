import { Schema, model, models } from "mongoose";

const mailSchema = new Schema({
    email: {
        type: String,
        require: true,
    },
    address: {
        type: String,
        require: true,
    }
});

const Email = models.Email || model("Email", mailSchema);
export default Email;