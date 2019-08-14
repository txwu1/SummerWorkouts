$(document).ready(function() {
    
    function validate(event){
        event.preventDefault();
        console.log($(this));
        validateCreateAccount($(this));
    };

    function  validateCreateAccount(form){
        let displayName = form[0][0].value;
        let email = form[0][1].value;
        let password = form[0][2].value;
    
        if (displayName.length < 1 ||
            email.length < 6 ||
            password.length < 6){
                console.log("ERROR IN VALIDATE");
        } else {
            form[0].removeEventListener("submit", validate);
            document.getElementById('createAccountForm').method = "post";
            document.getElementById('createAccountForm').action = "/setup/createUser";
            document.getElementById('createAccountForm').submit();
        }
    };

    let form = document.getElementById('createAccountForm');
    form.addEventListener("submit", validate);
});