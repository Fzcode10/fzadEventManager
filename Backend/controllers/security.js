const visitorCheckStatusModule = require('../models/visitorCheckInOut.js');
const VisitorModule = require('../models/visitorRegisteration.js');

exports.scanQrToggle = async (req, res) => {
    try {
        const { registrationId } = req.body;

        if (!registrationId) {
            return res.status(400).json({ error: "Invalid QR: Registration ID missing" });
        }

        // 1. Verify the visitor exists in the main registry
        const visitor = await VisitorModule.findOne({ registrationId });
        if (!visitor) {
            return res.status(404).json({ error: "Visitor not found in system!" });
        }

        // 2. Check current status
        let checkStatus = await visitorCheckStatusModule.findOne({ registrationId });

        // --- SCENARIO A: Perform Check-out ---
        if (checkStatus && checkStatus.status === "IN") {
            const updatedStatus = await visitorCheckStatusModule.findOneAndUpdate(
                { registrationId }, // Use consistent lowercase 'r'
                { $set: { checkOutTime: new Date(), status: "OUT" } },
                { returnDocument: 'after' } // This returns the updated document instead of the old one
            ); 

            return res.status(200).json({
                msg: `Goodbye, ${visitor.fullName}! Check-out successful.`,
                action: "OUT",
                visitor: { ...visitor._doc, ...updatedStatus._doc }
            });
        }

        // --- SCENARIO B: Perform Check-in (First time or Re-entry) 
        if (checkStatus && checkStatus.status === "OUT") {
            // console.log(checkStatus);
            return res.status(400).json({ error: "Visitor has already checked out." });
        }

        // Creat Check-in
        const checked = await visitorCheckStatusModule.create({
            registrationId,
            eventName: visitor.eventName,
            status: "IN",
            action: "IN"
        });



        if (!checked) {

            return res.status(500).json({ error: "Check-in failed: Unable to store data" });

        }

        return res.status(200).json({
            msg: `Welcome, ${visitor.fullName}! Check-in successful.`,
            action: "IN",
            visitor: { ...visitor._doc, ...checked._doc }
        });

    } catch (error) {
        console.error("Scanning Error:", error);
        return res.status(500).json({ error: "Server Error: " + error.message });
    }
};