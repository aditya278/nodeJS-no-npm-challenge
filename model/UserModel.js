class UserModel {
    constructor(firstName, lastName, phoneNumber, email, password, tocAgreement) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.password = password;
        this.tocAgreement = tocAgreement;
        this._id = (new Date()).getTime();
    }
}

module.exports = UserModel;