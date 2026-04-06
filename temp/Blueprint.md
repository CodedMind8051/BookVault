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
- Validate the input to ensure it contains only valid text (strings) and does not include any suspicious/invalid data.
- check if this user or username and email already exist or not if exists then throw error  
- hash the password 
- check 1st if avatar image sucessfully uploded in cloude or not , then check if info added database or not  

### Login user 

- Take email and password 
- Check all fields in given
- Validate the input to ensure it contains only valid text (strings) and does not include any suspicious/invalid data.
- Check user exit or not and password correct or not 
- Check user is banned or not 
- Generate jwt to use it for user login until its expires or user banned 
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
  - Make an borrow collect like this  
     --- 
     ```
     Borrow {
            userId,
            bookId,
            borrowDate,
            dueDate,
            returnDate,
            status ,
        } 
     ```
  - And save the borrow entry in it with that User __id 
  
- If Every things ok then return the succes response to user 
- ***If two or more user borrow same book at same time whoes only 1 or less than user copy left  then check it in millisecond and find who request 1st***
  

### User return books

- User give the books __id and also the number of copy he wants to return from the current copy he have 
- Check user must loged in 
- Check that book __id and  number of books is not null , empty or unfefined 
- Check that the book is borrowed by the same user who return it 
- Check that the number of return books copy not greater than the number of books he borrowed 
- Increase the Total number of left book by +number of copy he return and then only remove it from he user borrow history 
- Update the borrow status from the borrow collection 
- And then only show response to the user 


### User can see their borrow history 

- User call the api 
- Take user __id from jwt , if not get return error 
- Check if he is loged in or not if not then return error message "Please loged in or register first"
- Then fetch the user borrow history from Db 
- If it fetch correctly then give response other wise give error message to user 



# Admin system or api 

### Add and delete books 

- First check that this request come from admin route with proper username and password which also save in DB with other users and in Db their must be one Admin username which already save in db 
- ***If the req is in delete route :-***
  - Check that the book __id is not undefined or null or empty 
  - Then check book exist in db if not give error "Book is not available" 
  - If it found then delete it from db 
  - If it sucessfully deleted then return success response to admin
- ***If the req is in add route :-***
  - Ask Admin that he wants to add new book or just add more copies of existed books 
    - ***If he wants to add new books then do this :-***
      - Ask Book name , catagorey , Inital Total number of copies , Author and description detail to the admin
      - Check input is not empty or undifine or null
      - Validate the input to ensure it contains only valid text not malicious input 
      - Check that this if this book is  already exist or not , if exist return error (book already existed)
      - If not exist then add book to db and return success msg to admin
    - ***If he wants to add the more copies of existed book then do this :-***
      - Then ask book name and number of copies he wants to add 
      - Check input is not empty or undifine or null
      - Validate the input to ensure it contains only valid text or number  not malicious input 
      - Check that this book already exist or not if not exist then throw error "book not exist"
      - If exist then update the total number of copy and total number of left copies from +number of copies in add
      - If book total number and left number updated to db then send sucessfull response msg to admin other wise error msg .
   
### See which user borrow which books 

- Then Admin search the book name 
- First check that this request come from admin route with proper username and password which also save in DB with other users and in Db their must be one Admin username which already save in db 
- Check that the book name  is not undefined or null or empty 
- Then check book exist in db if not give error "Book is not available" 
- If exist then fetch the Book borrowed history on the basic of books __id from Db and retive User __id and fetch user and show all user name , number of copies , borrowed date and last return date and other info to Admin

### Ban user (This problem left =What happens to active borrows when a user is banned? — do their borrowed books get auto-returned/flagged? State the behavior, even if it's just "leave borrow records as-is.")

- Admin Enter user name or email or in UI their must be User __id (like when admin click ban btn on his profile)
- First check that this request come from admin route with proper username and password which also save in DB with other users and in Db their must be one Admin username which already save in db 
- Check user exist , if not then send error msg (use not found)
- If user exist then update the user Status to Baned=true in Db 
- If it sucessufully change or update send response to admin (user banned suceffully)
  

# Important rules:-

- Convert all input into lower case and then save it to DB (***except password and email.***) 
- Convert all input into lower case and then search or validate it (***except password and email.***) 
- Check every request that it is not malacious
- Use Rate limiting for every request (***30 request per min***) per user 
- With every request user __id must come with jwt 
- Proper error handling for every failure 