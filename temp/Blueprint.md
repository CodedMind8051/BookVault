# What is my goals and what features I am going to build 
 
- User System and API
  - User register and login  
  - User search/find books  
  - User borrow books  
    - User can only borrow 7 number of books at a time  
  - User return books  
  - User can see their borrow history  
  - User can rate and review books  
 

- Admin system or API  
  - Admin can add, delete books  
  - See which user borrows which books  
  - Ban user  


# User System design  

### Register User  

- Take username, email, mobile number, password, address, avatar image  
- Also take category of user from these three categories ***(Student, Employee, General)*** ***(default="general)"***
- Check if all required fields are given or not  
- If user does not provide an avatar image then use default avatar image  
- Check password strength and email format  
- Validate the input to ensure it contains only valid text (strings) and does not include any suspicious/invalid data  
- Check if this user or username and email already exist or not; if exists then throw error  
- Hash the password  
- Check first if avatar image is successfully uploaded in cloud or not, then check if info is added to database or not  

### Login user  

- Take email and password  
- Check all fields are given  
- Validate the input to ensure it contains only valid text (strings) and does not include any suspicious/invalid data  
- Check user exists or not and password is correct or not  
- Check if user is banned or not  
- Generate JWT to use it for user login until it expires or user is banned  
- Login the user  

### Search/find books  

- Take user input ==> ***Book name or Author name or Book Category (Sci Fi, Physics, Novel, Story etc.)***  
- Check input is not empty or undefined or null  
- Validate the input to ensure it contains only valid text, not malicious input  
- Search books in DB  
- If books are found and DB correctly returns the books list to user without any error, otherwise return message ***"Books not found"***  
- Return only ***150*** max books in one search and use pagination  

### Borrow Books  

- User selects the book and requests to borrow  
- Check user is logged in or not; if yes then proceed  
- Check user must not reach the borrow limit; if he has, then return an ***error (You reached the borrow limit)*** and if not then proceed the request  
- Check is it a valid book or not ***(means user does not manipulate the request, request must contain only book __id)***  
- Check user must not borrow the same book more than 2 at a time  
- Then search that book in DB with __id  
- Check if available or not  
- If available remove 1 copy from it  
  - Then add the book __id in the user borrow books list with borrow time/date and last ownership date after that book returns automatically  
  - Make a borrow collection like this  
     ---  
     ```
     Borrow {
            userId,
            bookId,
            borrowDate,
            dueDate,
            returnDate,
            copiesBorrowed,
            status [Borrowed, Returned] 
        } 
     ```
  - And save the borrow entry in it with that User __id  
- If everything is OK then return the success response to user  
- ***If two or more users borrow the same book at the same time when only 1 or less copies are left then check it in milliseconds and find who requested first***  

### User return books  

- User gives the book __id and also the number of copies he wants to return from the current copies he has  
- Check user must be logged in  
- Check that book __id and number of books is not null, empty or undefined  
- Check that book must exist  
- Check that the book is borrowed by the same user who returns it  
- Check that the number of returned book copies is not greater than the number of books he borrowed  
- Increase the total number of left books by +number of copies he returns and then only remove it from his borrow history  
- Update the borrow status from the borrow collection  
- And then only show response to the user  

### User can see their borrow history  

- User calls the API  
- Take user __id from JWT, if not get then return error  
- Check if he is logged in or not; if not then return error message "Please login or register first"  
- Then fetch the user borrow history from DB  
- If it fetches correctly then give response with pagination otherwise give error message to user  

### User can rate and review books  

#### Rate  

- User can rate books on the ***scale of 0 to 5 (0 means no star, 5 means 5 stars)***  
- Check that user must be logged in  
- Take input ***number*** from user and also the book __id  
- Check that the book must exist  
- Check if the user already rated this book; if yes then follow the below steps and just update the review of that user  
- If not then follow the below steps and add a new entry in ***rating collection***  
- If book exists, check the input that it must be number and between ***0 to 5***  
- Then save the rating in the ***rating collection*** with book __id and user __id  
- If added successfully in DB, then send success response to user  
- If I want to show book rating :-  
   - In ***Book collection*** save the book rating as the average of total ratings  
   - This average updates every 9 hours automatically  
   - And is visible to all users  
  

#### Review  

- Take user input as string and check that it is not null, undefined or empty and also take book __id  
- Check that user must be logged in  
- Check book must exist  
- If exists then save the review in DB in the ***review collection*** with user __id  
- If review is saved in DB then give user success message  
- User can also see review :-  
    - User can also see review without login  
    - User gives book __id  
    - We check that it is not null, undefined or empty  
    - If we get book __id then check this book exists in DB; if not give error message to user  
    - If exists then fetch the review of that book from ***review collection***  
    - If fetch review then show it to user with pagination  

# Admin system or API  

### Add and delete books  

- First check that this request comes from admin route with proper username and password which is also saved in DB with other users and in DB there must be one admin username already saved  
- ***If the request is in delete route :-***  
  - Check that the book __id is not undefined or null or empty  
  - Then check book exists in DB; if not give error "Book is not available"  
  - If found then delete it from DB  
  - Also delete its review from ***review collection*** and also delete it from ***rating collection***  
  - If it is successfully deleted then return success response to admin  
- ***If the request is in add route :-***  
  - Ask admin if he wants to add new book or just add more copies of existing books  
    - ***If he wants to add new books then do this :-***  
      - Ask book name, category, initial total number of copies, author and description details to the admin  
      - Check input is not empty or undefined or null  
      - Validate the input to ensure it contains only valid text not malicious input  
      - Check if this book already exists or not; if exists return error (book already existed)  
      - If not exist then add book to DB and also add an initial empty review to ***review collection*** with admin user __id  
      - And return success message to admin  
    - ***If he wants to add more copies of existing book then do this :-***  
      - Then ask book name and number of copies he wants to add  
      - Check input is not empty or undefined or null  
      - Validate the input to ensure it contains only valid text or number not malicious input  
      - Check that this book already exists or not; if not exist then throw error "book not exist"  
      - If exists then update the total number of copies and total number of left copies by +number of copies added  
      - If book total number and left number are updated in DB then send successful response message to admin otherwise error message  

### See which user borrows which books  

- Then admin searches the book name  
- First check that this request comes from admin route with proper username and password which is also saved in DB with other users and in DB there must be one admin username already saved  
- Check that the book name is not undefined or null or empty  
- Then check book exists in DB; if not give error "Book is not available"  
- If exists then fetch the book borrowed history on the basis of book __id from DB and retrieve user __id and fetch user and show all user name, number of copies, borrowed date and last return date and other info to admin  

### Ban user  

- Admin enters user name or email or in UI there must be user __id (like when admin clicks ban button on his profile)  
- First check that this request comes from admin route with proper username and password which is also saved in DB with other users and in DB there must be one admin username already saved  
- Check user exists; if not then send error message (user not found)  
- If user exists  
   - Check that the user borrowed books or not; if borrowed then check which books he borrowed and how many copies  
   - After checking this, search for that book by book __id and update the left books by +number of copies he borrowed and remove the user borrow history  
   - And then remove the  
   - Then update the user status to Banned=true in DB  
- If it is successfully changed or updated then send response to admin (user banned successfully)  
  

# Important rules:-  

- Convert all input into lower case and then save it to DB (***except password and email***)  
- Convert all input into lower case and then search or validate it (***except password and email***)  
- Check every request that it is not malicious  
- Use rate limiting for every request (***30 requests per min***) per user  
- With every request user __id must come with JWT  
- Proper error handling for every failure  