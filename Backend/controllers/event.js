const EventRequest = require('../models/events/eventRequest');
const VisitorRrgistrationodule = require('../models/visitorRegisteration');

exports.eventDetials = async (req, res) => {
    try{
        const {id} = req.params;
        // console.log(req.params);
        if(!id) {
            throw Error("Event Id not provided");
        }

        const event = await EventRequest.findOne({eventId : id});

        if(!event){
            throw Error("Event not found");
        }
        res.status(200).json({
            success: true,
            event
        })
    }catch(error){
        res.status(404).json({
            error: error.message
        })
    }
}

exports.eventVisitorRegister = async (req, res) => {
    try{
        const {id} = req.params;
        console.log(req.params);
        if(!id) {
            throw Error("Event Id not provided");
        }

        const visitors = await VisitorRrgistrationodule.find({eventId : id});

        if(!visitors){
            throw Error("Visitor not found");
        }
        console.log(visitors);

        res.status(200).json({
            success: true,
            visitors
        })
    }catch(error){
        res.status(404).json({
            error: error.message
        })
    }
}