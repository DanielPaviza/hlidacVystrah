
class UserFormHelper {

    constructor() {

        this.minPasswordLength = 6;
        this.emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        this.timeoutDuration = 5000;
    }

    EmailValid(email) {
        return this.emailRegex.test(email);
    }

    RenderInformationText = (text, isError, HandleClose = null) => {

        if (HandleClose != null)
            setTimeout(() => {
                HandleClose();
            }, this.timeoutDuration);

        return (
            <span className='d-flex my-1 formInfo'>
                <div className={`colorCircle ${isError ? 'red' : 'green'} me-1`}></div>
                <span className=''>{text}</span>
            </span>
        );
    }

}

export default UserFormHelper;