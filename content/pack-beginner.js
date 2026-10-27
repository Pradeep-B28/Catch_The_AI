// LOCKED CONTENT. Every challenge here is checked by tools/verify-content.mjs.
// Do not change it unless the content check passes afterwards.
// Field meanings are in content/SCHEMA.md.

export default {
  id: "b",
  name: "Beginner",
  tagline: "Everyday code. No coding needed.",
  language: "javascript",
  packVersion: 1,
  challenges: [
    {
      id: "b01",
      level: 1,
      title: "Discount calculator",
      task: "Take 10% off a price. A ₹1,000 shirt should cost ₹900.",
      code: [
        "function finalPrice(price, off) {",
        "  let cut = price * off;",
        "  return price - cut;",
        "}"
      ],
      notes: [
        "Takes a price and a discount number, like 10 for 10%.",
        "Multiplies the price by the discount number.",
        "Gives back the price minus that amount.",
        ""
      ],
      bugLine: 2,
      fix: "  let cut = price * off / 100;",
      test: { call: "finalPrice(1000, 10)", expected: "900", aiGot: "-9000" },
      checks: [["finalPrice(500, 50)", "250"], ["finalPrice(200, 0)", "200"]],
      why: "It multiplies by 10 instead of 10%. The shop would pay the customer ₹9,000 to take the shirt.",
      concept: "Percentages"
    },
    {
      id: "b02",
      level: 1,
      title: "Bill splitter",
      task: "Split a ₹1,200 bill between you and 3 friends. Each person pays ₹300.",
      code: [
        "function share(bill, friends) {",
        "  let people = friends + 1;",
        "  return bill / friends;",
        "}"
      ],
      notes: [
        "Takes the bill and how many friends are with you.",
        "Counts everyone: your friends plus you.",
        "Divides the bill by the number of friends.",
        ""
      ],
      bugLine: 3,
      fix: "  return bill / people;",
      test: { call: "share(1200, 3)", expected: "300", aiGot: "400" },
      checks: [["share(1000, 1)", "500"], ["share(900, 2)", "300"]],
      why: "It counts everyone on line 2, then forgets to use it. You get a free meal and your friends pay extra.",
      concept: "Using the right value"
    },
    {
      id: "b03",
      level: 1,
      title: "Pass or fail",
      task: "The pass mark is 35. A student with exactly 35 should pass.",
      code: [
        "function result(marks) {",
        "  if (marks > 35) {",
        "    return \"Pass\";",
        "  }",
        "  return \"Fail\";",
        "}"
      ],
      notes: [
        "Takes a student's marks.",
        "Checks if the marks are more than 35.",
        "If yes, the result is Pass.",
        "",
        "Otherwise, the result is Fail.",
        ""
      ],
      bugLine: 2,
      fix: "  if (marks >= 35) {",
      test: { call: "result(35)", expected: "\"Pass\"", aiGot: "\"Fail\"" },
      checks: [["result(34)", "\"Fail\""], ["result(80)", "\"Pass\""]],
      why: "\"More than 35\" leaves out 35 itself. It needs \"35 or more\", written as >=.",
      concept: "Boundary values"
    },
    {
      id: "b04",
      level: 1,
      title: "Voting age",
      task: "You can vote at 18. Someone born in 2000 can vote in 2026.",
      code: [
        "function canVote(birthYear, year) {",
        "  let age = birthYear - year;",
        "  return age >= 18;",
        "}"
      ],
      notes: [
        "Takes the birth year and this year.",
        "Works out age: birth year minus this year.",
        "Says yes if the age is 18 or more.",
        ""
      ],
      bugLine: 2,
      fix: "  let age = year - birthYear;",
      test: { call: "canVote(2000, 2026)", expected: "true", aiGot: "false" },
      checks: [["canVote(2010, 2026)", "false"], ["canVote(2008, 2026)", "true"]],
      why: "It subtracts the wrong way round, so everyone's age comes out negative. Nobody would ever be allowed to vote.",
      concept: "Order of values"
    },
    {
      id: "b05",
      level: 1,
      title: "Average marks",
      task: "Find the average of three marks. 60, 70 and 80 should give 70.",
      code: [
        "function average(a, b, c) {",
        "  let total = a + b + c;",
        "  return total / 2;",
        "}"
      ],
      notes: [
        "Takes three marks.",
        "Adds all three together.",
        "Divides the total by 2.",
        ""
      ],
      bugLine: 3,
      fix: "  return total / 3;",
      test: { call: "average(60, 70, 80)", expected: "70", aiGot: "105" },
      checks: [["average(90, 90, 90)", "90"], ["average(0, 0, 30)", "10"]],
      why: "There are three marks, so the total must be divided by 3. Dividing by 2 gives an average higher than any single mark.",
      concept: "Averages"
    },
    {
      id: "b06",
      level: 2,
      title: "Strike rate",
      task: "Strike rate is runs per 100 balls. 50 runs off 25 balls is a strike rate of 200.",
      code: [
        "function strikeRate(runs, balls) {",
        "  if (balls === 0) return 0;",
        "  let rate = balls / runs * 100;",
        "  return Math.round(rate);",
        "}"
      ],
      notes: [
        "Takes the runs scored and the balls faced.",
        "If no balls were faced, the rate is 0.",
        "Divides balls by runs, then multiplies by 100.",
        "Rounds it to a whole number.",
        ""
      ],
      bugLine: 3,
      fix: "  let rate = runs / balls * 100;",
      test: { call: "strikeRate(50, 25)", expected: "200", aiGot: "50" },
      checks: [["strikeRate(45, 30)", "150"], ["strikeRate(30, 30)", "100"], ["strikeRate(0, 0)", "0"]],
      why: "It divides balls by runs, which is upside down. A batter scoring quickly would look slow.",
      concept: "Order of values"
    },
    {
      id: "b07",
      level: 2,
      title: "Cart total",
      task: "4 items at ₹250 each should cost ₹1,000.",
      code: [
        "function cartTotal(price, qty) {",
        "  let total = 0;",
        "  for (let i = 1; i < qty; i++) {",
        "    total = total + price;",
        "  }",
        "  return total;",
        "}"
      ],
      notes: [
        "Takes the price of one item and how many you buy.",
        "Starts the total at 0.",
        "Counts i = 1, 2, 3 and so on, while i is less than qty.",
        "Adds the price to the total each time.",
        "",
        "Gives back the total.",
        ""
      ],
      bugLine: 3,
      fix: "  for (let i = 1; i <= qty; i++) {",
      test: { call: "cartTotal(250, 4)", expected: "1000", aiGot: "750" },
      checks: [["cartTotal(100, 1)", "100"], ["cartTotal(99, 0)", "0"]],
      why: "Counting from 1 while i is less than 4 only counts 1, 2 and 3. One item is always free.",
      concept: "Loop limits"
    },
    {
      id: "b08",
      level: 2,
      title: "Free delivery",
      task: "Delivery is free on orders of ₹500 or more. Smaller orders pay ₹40.",
      code: [
        "function delivery(order) {",
        "  if (order >= 500) {",
        "    return 40;",
        "  }",
        "  return 0;",
        "}"
      ],
      notes: [
        "Takes the order amount.",
        "Checks if the order is 500 or more.",
        "If yes, delivery costs 40.",
        "",
        "Otherwise, delivery costs 0.",
        ""
      ],
      bugLine: 2,
      fix: "  if (order < 500) {",
      test: { call: "delivery(800)", expected: "0", aiGot: "40" },
      checks: [["delivery(300)", "40"], ["delivery(500)", "0"]],
      why: "The check is the wrong way round. Big orders pay for delivery and small orders get it free.",
      concept: "Conditions"
    },
    {
      id: "b09",
      level: 2,
      title: "Phone number check",
      task: "Indian mobile numbers have 10 digits. 9876543210 is a valid number.",
      code: [
        "function validPhone(num) {",
        "  let digits = String(num);",
        "  return digits.length === 12;",
        "}"
      ],
      notes: [
        "Takes a phone number.",
        "Turns the number into text so the digits can be counted.",
        "Says valid only if there are exactly 12 digits.",
        ""
      ],
      bugLine: 3,
      fix: "  return digits.length === 10;",
      test: { call: "validPhone(9876543210)", expected: "true", aiGot: "false" },
      checks: [["validPhone(98765)", "false"], ["validPhone(919876543210)", "false"]],
      why: "It expects 12 digits, so every real 10 digit number is rejected. Nobody could sign up.",
      concept: "Input checks"
    },
    {
      id: "b10",
      level: 3,
      title: "Hours and minutes",
      task: "Show minutes as hours and minutes. 150 minutes is 2h 30m.",
      code: [
        "function hm(mins) {",
        "  let h = Math.floor(mins / 60);",
        "  let m = mins / 60;",
        "  return h + \"h \" + m + \"m\";",
        "}"
      ],
      notes: [
        "Takes a number of minutes.",
        "Hours: divides by 60 and drops the decimal part.",
        "Minutes: divides by 60 again.",
        "Joins them into text like 2h 30m.",
        ""
      ],
      bugLine: 3,
      fix: "  let m = mins % 60;",
      test: { call: "hm(150)", expected: "\"2h 30m\"", aiGot: "\"2h 2.5m\"" },
      checks: [["hm(45)", "\"0h 45m\""], ["hm(120)", "\"2h 0m\""]],
      why: "Minutes should be what is left over after taking out full hours. The % sign gives the leftover. Dividing again gives 2.5.",
      concept: "Remainders"
    }
  ]
};
