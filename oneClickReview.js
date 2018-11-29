/**
 *
 * 使用方法： node onClickReview --sid <sid> --type <d or w> --command <rr or rb>
 *     type 是指周或日志， 主要用于批复command rb
 *     command 可以是rr reviewReport 活着 rb reviewBlogs. 当为rr时， 可以不输入type.
 */




var request = require("request");
var commands = new require("./commands")();
var students = [];
var jsessionid = "";
var frequen_reply_to_students = [
  "已阅。祝贺顺利完成毕业实习!",
  '已阅。实习辛苦了,祝贺顺利完成毕业实习!'
];
// some test
var args = process.argv;
var sid = "";
var blogType = "d";
var command = "rb"; // review blogs. this is default command
console.log(args);




var index = args.indexOf("--sid");
var blogTypeIndex = args.indexOf("--type");
var commandIndex = args.indexOf("--command");
index = index === -1 ? false : index + 1;
blogTypeIndex = blogTypeIndex === -1 ? false : blogTypeIndex + 1;
commandIndex = commandIndex === -1 ? false : commandIndex + 1;


if (index) {
  sid = args[index];
  console.log("user sid is %s", sid);
}

if (blogTypeIndex) {
  blogType = args[blogTypeIndex];
  console.log("blog type is %s", blogType);
}

if (commandIndex) {
    command = args[commandIndex];
    console.log("command is %s", command);
}


function reviewBlogs() {
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
      type: blogType,
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
        try {
            resolveReviewBlogs(students, sid);
        } catch(e) {
            console.error(e);
        }
        console.log("Will review total %d studens. ", students.length);

    } else {
      console.log("没有学生可以批阅！");

    }
  });
}

async function resolveReviewBlogs(students,sid) {

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
        res_body = await requestToReview(options);
        isSuccess = JSON.parse(res_body).success;

      }
      console.log(res_body);

  });
}

function reviewReports() {
    var options = {
        method: 'POST',
        url: 'http://www.xybsyw.com/json/practice/school/report/loadReport.xhtml',
        headers: {
            'Postman-Token': '853ab258-535d-490d-bbc9-f5151d730a0d',
            'cache-control': 'no-cache',
            Cookie: 'JSESSIONID=' + sid + '; Hm_lvt_5b943524066f14e8c8dc6a3c3a69d9ca=1540560756; xybsyw_login_method_type=NORMAL; xybsyw_login_school_id=7822; xybsyw_login_school_name=%E6%B1%9F%E8%8B%8F%E5%A4%A7%E5%AD%A6; xybsyw_login_user_name=1000004788; Hm_lpvt_5b943524066f14e8c8dc6a3c3a69d9ca=1540560819; SERVERID=a400a61a5a6aa2ec013302c9b2706450|1540560848|1540560755',
            'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
        },
        formData: {
            on: 'true',
            page: '1',
            pageSize: '500',
            reviewStatus: 'PENDING',
            schoolTermId: '1159',
            schoolYear: '2018'
        }
    };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            students = JSON.parse(body);
            students = students && students.datas;
            console.log(students);
            console.log("students ready!");
            if (students && students.length > 0) {
                try {
                    resolveReviewReports(students);
                } catch(e) {
                    console.error(e)
                }
                console.log("Will review total %d students for reports . ", students.length);

            } else {
                console.log("没有学生的报告可以批阅！");

            }
        });
};


async function resolveReviewReports (students) {
    var num_retry = 10;
    students.forEach(async function(student) {
        var id = student.id;
        var version = 0;
        var options;
        var success = false;

        options = setOptionsForReports(id);
        var res_body = await requestToReview(options);
        var isSuccess = JSON.parse(res_body).success;
        while(!isSuccess && --num_retry > 0) {
            version += 1;
            console.log(" student %s retry %s ", student.id, version);
            let format = {
                reviewStatus: 'PASS'
            }
            options = setOptionsForReports(id, format);
            res_body = await requestToReview(options);
            isSuccess = JSON.parse(res_body).success;

        }
        console.log(res_body);

    });
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

function setOptionsForReports(id, format) {
    let size = frequen_reply_to_students.length;
    let indexForReplyContent = id % size;
    let content = frequen_reply_to_students[indexForReplyContent];
    let formatData;
    if (!!format) {
        format.comment = content;
        format.id = id;
        formatData = format;
    } else {
        formatData = {
            comment: content,
            reviewStatus: 'PASS',
            id: id,
            score: '5'
        }
    }

    return {
        method: 'POST',
        url: 'http://www.xybsyw.com/json/practice/school/report/reviewReport.xhtml',
        headers: {
            'Postman-Token': '1020032f-471d-4f57-90e1-38bc7bf3cf39',
            'cache-control': 'no-cache',
            Cookie: 'JSESSIONID='+sid+'; Hm_lvt_5b943524066f14e8c8dc6a3c3a69d9ca=1540560756; xybsyw_login_method_type=NORMAL; xybsyw_login_school_id=7822; xybsyw_login_school_name=%E6%B1%9F%E8%8B%8F%E5%A4%A7%E5%AD%A6; xybsyw_login_user_name=1000004788; Hm_lpvt_5b943524066f14e8c8dc6a3c3a69d9ca=1540562736; SERVERID=a400a61a5a6aa2ec013302c9b2706450|1540562744|1540560755',
            'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
        },
        formData: formatData
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


function start(taskToRun) {
  taskToRun();
}

// According to the type to run different task;
var runTask = reviewBlogs;

switch (command) {
    case 'rb':
        runTask = reviewBlogs;
        break;
    case 'rr':
        runTask = reviewReports;
        break;
    default:
        runTask = reviewBlogs;
        return;
}



start(runTask);