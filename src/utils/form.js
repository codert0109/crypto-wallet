import jwt from 'jsonwebtoken';

export const ConvertToUrlForm = (data) => {
    var formBody = [];
    for (var property in data) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(data[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');
    return formBody;
}

export const generateAccessToken = (token, data) => {
  return jwt.sign(data, token, { expiresIn: "10h" });
};