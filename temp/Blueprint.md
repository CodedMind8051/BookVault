# What is my goals and what features i am going to build 
 
- User System and api
  - User register and login 
  - User search/find books 
  - User borrow books
    - user can only borrow certen number of books at a time
  - User return books   
  - User can see their borrow history 
  - user can rate and review books 
 

- Admin system or api 
  - Admin can add , delete books 
  - See which user borrow which books 
  - Ban user 
  - See total number of books and also see the number of copy left of single book 


# User System design 

### Register User 

- Take username , email , mobile number , password , address , avatar image 
- Also Take category of user from this three category ***(Student , Employee , General)*** 
- check if all required field given or not 
- if user not provide avatar image then use default avatar image 
- check password strength and email formet
- Validate the input to ensure it contains only valid text (strings) and does not include numbers, special characters, or suspicious/invalid data.
- check if this user or username already exist or not if exists then throw error  
- hash the password 
- check 1st if avatar image sucessfully uploded in cloude or not , then check if info added database or not  

### Login user 

- Take email and password 
- Check all fields in given
- Validate the input to ensure it contains only valid text (strings) and does not include numbers, special characters, or suspicious/invalid data.
- Check user exit or not and password correct or not 
- Check user is banned or not 
- Generate jwt to use it for user login until its expires 
- Login the User

### Search/find books 

- Take user input ==> ***Book name or Author name or Book Catagieory (Sci Fi , Physic , Novel , Story etc.)***
- Check input is not empty or undifine or null
- Validate the input to ensure it contains only valid text not malicious input 
- Search books in Db 
- If books found and Db correctly return the books list to user without any error , other wise return message ***"Books not found"*** 
- Return only ***150*** max books in 1 search.

### Borrow Books

- User select the book and request for borrow 
- Check user is logged in or not , if yes then proceed 
- Check , user must not reach the borrow limit if he is , then return an ***error(You reach the borrow limit)*** and if he is not then proceed the request.  
- Check is it valid book or not ***(means user not manuplate the request , request must contain only book __id)***
- Check user must not borrow same book more than 2 at a time.
- Then search that book in Db with __id
- Check , is available or not  
- If available remove its 1 copy from it 
  - Then add the book __id in the user borrow books list with borrow time/date and last owreship date after that book return automatically .
- If Every things ok then return the succes response to user 
  

### User return books

- 








# Important rules:-

- Convert all input into lower case and then save it to DB (***except password and email.***) 
- Convert all input into lower case and then search or validate it (***except password and email.***) 
- Use Rate limiting for every request (***30 request per min***)