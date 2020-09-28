# nodeJS-no-npm-challenge
Implementing a HTTP/HTTPs server using node.js without using a single npm module (pure NodeJs).

## How to use:
- Clone the repo and run the below command
  ```
  node index.js 
  ```
- **User Schema:**
  ```
  -firstName
  -lastName
  -phoneNumber (unique)
  -email
  -password
  -toc
  -_id : new Date() (log the timestamp)
  -(hobbies - unless specified)
  ```

- Below are the routes for the API:
  - ```POST/users``` with data in the Body of the request in form of above user schema, will register a new user.
  - ```GET/users``` without Body or Query String will consolidate all the users data in one response.
  - ```PUT/hobby?phoneNumber=<10-digit-number>``` with hobbies as an Array in the body for the request, will update the user with the phone number to have the specified hobbies.
  - ```GET/users?phoneNumber=<10-digit-number>``` request will allow you to access individual users data.
  - ```DELETE/hobby?phoneNumber=<10-digit-number>&hobby=<any-hobby>``` as a request will delete the hobby specified in the request from the hobbies array of the user specified by the phone number in the request.
  - ```GET/age?phoneNumber=<10-digit-number>``` will give you the age of the user (i.e. the time since the user registered with the API.
