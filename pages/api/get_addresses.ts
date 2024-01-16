// pages/api/getAllAddresses.ts

import { NextApiRequest, NextApiResponse } from "next";
import { connectMongoDB } from "../../libs/MongoConnect";
import Email from "../../models/EmailModel";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).send({ msg: "Only get requests are allowed." });
        return;
    }

    try {
        await connectMongoDB();

        // Fetch all addresses from the database
        const allAddresses = await Email.find({}, { address: 1, _id: 0 });

        res.status(200).json(allAddresses);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}
