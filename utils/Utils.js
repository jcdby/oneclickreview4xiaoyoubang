import request from 'request';

export default class Utils {
    request() {
        return new Promise((resolve) => {
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                resolve(body);
            });
        })
    }
}