var request = require("request");
var students = [];
var jsessionid = "";
var frequen_reply_to_students = [
  "已阅。祝贺顺利完成毕业实习!",
  '已阅， 实习辛苦了,祝贺顺利完成毕业实习!'
];

var args = process.argv;
var sid = "";
console.log(args);


var index = args.indexOf("--sid");
index = index == -1 ? false : index + 1;


if (index) {
  sid = args[index];
  console.log(sid);
}


function getStudents(sid) {
  var options = {
    method: 'POST',
    url: 'http://www.xybsyw.com/json/practice/school/blogs/loadBlogsBySchool.xhtml',
    headers: {
      'Postman-Token': '853ab258-535d-490d-bbc9-f5151d730a0d',
      'cache-control': 'no-cache',
      Cookie: 'JSESSIONID='+sid+'; Hm_lvt_5b943524066f14e8c8dc6a3c3a69d9ca=1540560756; xybsyw_login_method_type=NORMAL; xybsyw_login_school_id=7822; xybsyw_login_school_name=%E6%B1%9F%E8%8B%8F%E5%A4%A7%E5%AD%A6; xybsyw_login_user_name=1000004788; Hm_lpvt_5b943524066f14e8c8dc6a3c3a69d9ca=1540560819; SERVERID=a400a61a5a6aa2ec013302c9b2706450|1540560848|1540560755',
      'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
    },
    formData: {
      on: 'true',
      type: 'd',
      schoolyear: '2018',
      schoolTermId: '1159',
      status: 'REVIEW_WAIT',
      page: '1',
      pageSize: '1000'
    }
  };
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    students = JSON.parse(body);
    students = students && students.datas;
    console.log(students);
    console.log("students ready!");
    if (students && students.length > 0) {
      resolve_review(students, sid);

    } else {
      console.log("没有学生可以批阅！");

    }
  });
}

async function resolve_review(students,sid) {

  var num_retry = 10;
  students.forEach(async function(student) {
    var id = student.id;
    var version = 0;
    var options;
    var success = false;

      options = setOptions(id,sid, version);
      var res_body = await requestToReview(options);
      var isSuccess = JSON.parse(res_body).success;
      while(!isSuccess && --num_retry) {
        version += 1;
        console.log(" student %s retry %s ", student.name, version);
        options = setOptions(id,sid,version);
        res_body = await requestToReview(options)
        isSuccess = JSON.parse(res_body).success;
      }

      console.log(res_body);

        
  })
}


function setOptions(id,sid, version) {

  let size = frequen_reply_to_students.length;
  let indexForReplyContent = id % size;
  let content = frequen_reply_to_students[indexForReplyContent]

  return {
    method: 'POST',
    url: 'http://www.xybsyw.com/json/practice/school/blogs/reviewBlogs.xhtml',
    headers: {
      'Postman-Token': '1020032f-471d-4f57-90e1-38bc7bf3cf39',
      'cache-control': 'no-cache',
      Cookie: 'JSESSIONID='+sid+'; Hm_lvt_5b943524066f14e8c8dc6a3c3a69d9ca=1540560756; xybsyw_login_method_type=NORMAL; xybsyw_login_school_id=7822; xybsyw_login_school_name=%E6%B1%9F%E8%8B%8F%E5%A4%A7%E5%AD%A6; xybsyw_login_user_name=1000004788; Hm_lpvt_5b943524066f14e8c8dc6a3c3a69d9ca=1540562736; SERVERID=a400a61a5a6aa2ec013302c9b2706450|1540562744|1540560755',
      'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
    },
    formData: {
      blogsId: id,
      status: 'REVIEW_PASS',
      version: version,
      content: content,
      needReview: 'true'
    }
  };
}

function requestToReview(options) {
  return new Promise((resolve) => {
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      resolve(body);
    });
  })

  
}


getStudents(sid);