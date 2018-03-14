/**
 * @file this file contians classes of message objects used to communicate between web-server, central-server, and Conneto
 * @author SSH
 * @todo would it be needed?  
 */

 /**
  * @class
  * @description this is the basic class containing essential fields for evry message
  */
class SocketMessage {
    
    /**
     * 
     * @param {string} command - it describes the purpose of the message 
     */
    constructor(command){
        this.command = command;
        this.userID = "";
    }

    constructor(command, userID){
        this.command = command;
        this.userID = userID;
    }    
}


class ConnetoSocketMessage extends SocketMessage {
    /**
     * @constructor {type} name
     * @param {*} command 
     * @param {*} userID 
     * @param {*} hostInfo 
     */
    constructor(command, userID, hostInfo){
        super(command, userID);
        this.hostID = hostID;
    }

    
}

