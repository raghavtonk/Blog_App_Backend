
const blogDataValidation = ({title,textBody})=>{
    return new Promise((resolve,reject)=>{
        if(!title) reject("Blog title field cannot be empty");
        if(!textBody) reject("Blog body field cannot be empty");
        if(typeof title !== 'string') reject("Blog title is not a text");
        if(typeof textBody !== 'string') reject("Blog body is not a text");
        if(title.length < 3 || title.length > 100) reject('Blog title length should be 3-100');
        if(textBody.length < 3 || textBody.length > 1000) reject('Blog body length should be 3-1000');
        resolve();
    })
}

module.exports = {blogDataValidation};