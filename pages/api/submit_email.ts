import { NextApiRequest, NextApiResponse } from "next";
import { connectMongoDB } from "../../libs/MongoConnect";
import Email from "../../models/EmailModel";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.status(405).send({ msg: "Only post request are allowed." });
    };
    const { email, address } = req.body as { email: string; address: string };
    // console.log("Received data:", email, address);

    try {
        await connectMongoDB();

        const existingEmail = await Email.findOne({ email });

        if (existingEmail) {
            res.status(404).json({ success: false, message: "Email already exists" });
        } else {
            await Email.create({ email, address });
            res.status(201).json({ success: true })
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error });
    }
}