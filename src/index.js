//Business logic
class FBIListFetcher {
  constructor() {

  }

  static fetchList() {
    let promise = new Promise(function(resolve, reject) {
      let request = new XMLHttpRequest();
      const url = 'https://api.fbi.gov/wanted/v1/list?page=2';

      request.addEventListener("loadend", 
        function(){
          const response = JSON.parse(this.responseText);
          if (this.status === 200) {
            resolve(response);
          } else {
            reject("Error: status was" + this.status);
          }
        }
      );
      request.open("GET", url, true);
      request.send();
    });

    promise.then((response)=> {
      printJson(response);
    }, (response)=>{
      printError(response);
    });

  }

  static searchList(query) {
    let relevantItems = {
      items: []
    };
    let amtOfSuccesses = 0;
    let amtOfFailures = 0;
    let promise = new Promise(function(resolve, reject) {
      for(let p = 1; p < 49; p++) {
        let request = new XMLHttpRequest();
        const url = 'https://api.fbi.gov/wanted/v1/list?page='+p;

        request.addEventListener("loadend", 
          function(){
            const response = JSON.parse(this.responseText);
            if (this.status === 200) {
              amtOfSuccesses++;
              response.items.forEach((element)=>{
                
                if(element.title.toLowerCase().split(" ").includes(query.toLowerCase())) {
                  relevantItems.items.push(element);
                }
              });
              if(amtOfSuccesses > 30) {
                resolve(relevantItems);
              }
            } else {
              amtOfFailures++;
              if(amtOfFailures > 10) {
                reject("error");
              }
            }
          }
        );
        request.open("GET", url, true);
        request.send();
      }
    });

    promise.then(function(theItems) {
      printJson(theItems);
    }, function(error) {
      printError(error);
    });

    
  }
}
// UI Logic

window.onload = function () {
  FBIListFetcher.fetchList();
  document.querySelector("form").onsubmit = takeSearchForm;
};

function printError(errorMessage) {
  let spot = document.getElementById("wantedList");
  spot.innerText = errorMessage;
}

function takeSearchForm(event) {
  event.preventDefault();
  FBIListFetcher.searchList(document.getElementById("location").value);
}

function printJson(apiJson) {
  let spot = document.getElementById("wantedList");
  let ul = document.createElement("ul");
  apiJson.items.forEach((element)=> {
    let h1 = document.createElement("h1");
    h1.innerText = element.title;
    if(element.reward_max !== 0) {
      h1.innerText += ": $" + element.reward_max;
    }
    
    let h2 = document.createElement("h2");
    h2.innerText = element.url;
    let a = document.createElement("a");
    a.setAttribute("href", element.url);
    a.append(h2);

    

    let li = document.createElement("li");
    li.append(h1);
    if(element.images !== null) {
      let img = document.createElement("img");
      img.setAttribute("src", element["images"][0]["thumb"]);
      li.append(img);
    }
    if(element.subjects !== null) {
      let ul2 = document.createElement("ul");
      element.subjects.forEach((subject)=> {
        let li2 = document.createElement("li");
        let h22 = document.createElement("h2");
        h22.innerText = subject;
        li2.append(h22);
        ul2.append(li2);
      });
      li.append(ul2);
    }
    li.append(a);
    if(element.scars_and_marks !== null) {
      let p = document.createElement("p");
      p.innerText = element.scars_and_marks;
      li.append(p);
    }
    if(element.aliases !== null) {
      let ul2 = document.createElement("ul");
      element.aliases.forEach((alias)=> {
        let li2 = document.createElement("li");
        li2.innerText = alias;
        ul2.append(li2);
      });
      li.append(ul2);
    }
    ul.append(li);
  });
  spot.innerText = "";
  spot.append(ul);

}