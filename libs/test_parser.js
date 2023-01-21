module.exports = function parser(text) {
    let test = {
        title: "",
        questions: []
    }

    let state = 0;
    let buf = "";
    let last_q = "";

    for (let s of text) {
        switch (state) {
            case 0:
                if (s == "#") {
                    state = "TITLE"
                }
                break;
            case "TITLE":
                if (s == "#") {
                    state = "QUESTION"
                } else if (s == "\n") {
                    state = 0
                } else {
                    state = "TITLE_TEXT"
                    buf = s
                }
                break;
            case "TITLE_TEXT":
                if (s == "\n") {
                    state = 0
                    test.title = buf
                    buf = ""
                } else {
                    buf += s
                }
                break;
            case "QUESTION":
                if (s == "\n") {
                    test.questions[buf] = []
                    last_q = buf
                    state = "ANSWER"
                    buf = ""
                } else {
                    buf += s
                }
                break;
            case "ANSWER":
                if (s == " " || s == "-") {
                    state = "ANSWER"
                } else if (s == "\n") {
                    buf = ""
                    state = 1
                } else {
                    state = "ANSWER_TEXT"
                    buf = s
                }
                break;
            case "ANSWER_TEXT":
                if (s == "\n") {
                    state = 1
                    test.questions[last_q].push(buf)
                    buf = ""
                } else {
                    buf += s
                }
                break;
            case 1:
                if (s == "#") {
                    state = "TITLE"
                } else if (s == "-") {
                    state = "ANSWER"
                }
                break;
        }
    }
    return test
}