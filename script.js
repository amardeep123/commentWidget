let commentArr = [];
let lastReplyId;

function checkDataFunc(iEvent) {
  let btn = document.getElementById('commentButton');
  disableBtnFunc(iEvent, btn);
}

function disableBtnFunc(iEvent, btn) {
  if (iEvent.value == '') {
    btn.disabled = true;
  }
  else {
    btn.disabled = false;
  }
}

function commentFunc(iData) {
  let commentObj = { title: iData.value, id: new Date().getTime(), level: 0 };
  commentArr.push(commentObj);
  let mainContainer = document.getElementById('commentContainer');
  mainContainer.append(createCommentCard(commentObj));
  updateDataToStorage(commentObj);
  iData.value = '';
  checkDataFunc({ value: '' });
}


function renderData() {
  let commentArr = getDataFromStorage();
  console.log("before sort => ", commentArr);
  if (commentArr && commentArr.length) {
    commentArr = sortDataFunc(commentArr);
    console.log("after sort => ", commentArr);
    let mainContainer = document.getElementById('commentContainer');
    for (let comment of commentArr) {
      let card = createCommentCard(comment);
      mainContainer.append(card);
      if (comment.hasOwnProperty('child') && comment.child.length) {
        renderNestedData(comment);
      }
    }
  }
}

function renderNestedData(iParObj) {
  let parentEl = document.getElementById('parent' + iParObj.id);
  for (let comment of iParObj.child) {
    let card = createCommentCard(comment);
    parentEl.append(card);
    if (comment.hasOwnProperty('child') && comment.child.length) {
      renderNestedData(comment);
    }
  }
}

function sortDataFunc(iArr) {
  let iParentArr = iArr.filter(e => e.level === 0);
  for (let parent of iParentArr) {
    parent.child = [];
    sortFunc(parent, iArr);
  }

  function sortFunc(iParObj, tempArr) {
    for (let temp of tempArr) {
      if (iParObj.id == temp.parentId) {
        iParObj.child.push(temp);
        temp.child = [];
        temp.level = iParObj.level + 1;
        sortFunc(temp, tempArr);
      }
    }
  }
  return iParentArr;
}

function createCommentCard(iObj) {
  let card = document.createElement('div');
  card.className = "fw";
  card.style.height = "80px";
  // card.style.transition = 'height 0.4s linear'
  card.style.overflow = "hidden";
  card.style.paddingLeft = iObj.level ? '50px' : '0px';
  card.id = 'parent' + iObj.id;
  if(iObj.level == 0) {
    card.style.borderWidth = "0px 0px 1px";
    card.style.borderStyle = "solid";
    card.style.borderColor = "gray";
  }

  let logoCommentContainer =  document.createElement('div');
  logoCommentContainer.className = "flex flex-row fw";
  logoCommentContainer.style.height = "auto";

  let logoCont = document.createElement('div');
  logoCont.className = "flex flex-row ai-start pt";
  logoCont.style.width = "50px";

  let logo = document.createElement('div');
  logo.className = "circle flex flex-row jc-center ai-center";
  logo.innerHTML = '<svg style="height:30px;" viewBox="0 0 24 24"> <path fill="#c9c9c9" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" /> </svg>';

  logoCont.append(logo);

  let commentCont = document.createElement('div');
  commentCont.className = 'flex flex-col ai-start';
  commentCont.style.width = "calc(100% - 50px)";

  let comment = document.createElement('div');
  comment.className = "fw p";
  comment.style.overflow = "hidden";


  let paraBtn = document.createElement('div');
  paraBtn.className = 'fhw flex flex-col ai-start jc-sb';

  let para = document.createElement('p')
  para.innerText = iObj.title;

  let btnBox = document.createElement('div');
  btnBox.className = "mt";
  btnBox.id = 'btnBox' + iObj.id;
  let btn = document.createElement('button');
  btn.style.padding = '5px';
  btn.id = 'btn' + iObj.id;
  btn.innerText = 'Reply';
  btn.dataset.id = iObj.id;
  btnBox.append(btn);
  
  let viewReply = document.createElement('button');
  viewReply.style.padding = '5px';
  viewReply.style.marginLeft = '5px';
  viewReply.innerText = 'View Reply';
  viewReply.dataset.id = iObj.id;
  viewReply.id = 'viewReply' + iObj.id;
  viewReply.addEventListener('click', (eve) => {
    if(card.style.height == 'auto') {
      card.style.height = '80px';
      viewReply.innerText = 'View Reply';
    }
    else {
      viewReply.innerText = 'Hide Reply';
      card.style.height = "auto";
    }
  })
  btnBox.append(viewReply);

  let textEl = createReplyFieldFunc(iObj.id);
  btnBox.append(textEl);

  btn.addEventListener('click', (eve) => {
    let currentId = eve.target.dataset.id;
    hideCurrentReplyBtn();
    if(card.style.height == '80px') {
      card.style.height = '100px';
    }
    else if(card.style.height == 'auto') {
      card.style.height = 'auto';
    }
    btn.style.display = 'none';
    viewReply.style.display = 'none';
    textEl.style.display = '';
    lastReplyId = currentId;
  })


  paraBtn.append(para);
  paraBtn.append(btnBox);
  comment.append(paraBtn);
  commentCont.append(comment);

  logoCommentContainer.append(logoCont);
  logoCommentContainer.append(commentCont);
  card.append(logoCommentContainer);

  return card;

}

renderData();

function getDataFromStorage() {
  let data = localStorage.getItem('commentData');
  if (data) {
    return JSON.parse(data);
  }
  return null;
}

function updateDataToStorage(iData) {
  let preData = getDataFromStorage();
  if (preData && preData.length) {
    preData.push(iData);
    localStorage.setItem('commentData', JSON.stringify(preData));
  }
  else {
    localStorage.setItem('commentData', JSON.stringify([iData]));
  }
}


function createReplyFieldFunc(iId) {
  let cont = document.createElement('div');
  cont.className = "flex flex-row jc-se ai-center fw ptb";
  cont.id = 'replyContBox' + iId;
  cont.style.display = 'none';

  let textarea = document.createElement('textarea');
  textarea.className = 'fhw';
  textarea.id = 'commentText' + iId;
  textarea.placeholder = "Type your comment here...";
  textarea.cols = 100;
  textarea.rows = 3;

  let btnReply = document.createElement('button');
  btnReply.className = "commentBtn";
  btnReply.disabled = true;
  btnReply.innerText = "Reply";

  let btnCancel = document.createElement('button');
  btnCancel.className = "commentBtn";
  btnCancel.innerText = "Cancel";
  btnCancel.addEventListener("click", () => {
    let par = document.getElementById('parent' + iId);
    // par.style.height = '80px';
    if(par.style.height == '100px') {
      par.style.height = '80px';
    }
    else if(par.style.height == 'auto') {
      par.style.height = 'auto';
    }
    disableBtnFunc({ value: '' }, btnReply);
    hideCurrentReplyBtn();
    textarea.value = '';
  });


  textarea.addEventListener("keyup", (el) => {
    disableBtnFunc({ value: el.target.value }, btnReply);
  })


  let nestedReplyFunc = () => {
    let parent = document.getElementById('parent' + lastReplyId);
    let nestedCmntObj = { title: textarea.value, id: new Date().getTime(), parentId: lastReplyId, level: 1 };
    updateDataToStorage(nestedCmntObj);
    parent.append(createCommentCard(nestedCmntObj));
    disableBtnFunc({ value: '' }, btnReply);
    let viewReplyAuto = document.getElementById('viewReply' + lastReplyId);
    viewReplyAuto.click();
    hideCurrentReplyBtn();
    textarea.value = '';
    
  }

  btnReply.addEventListener("click", nestedReplyFunc);

  cont.append(textarea);
  cont.append(btnReply);
  cont.append(btnCancel);
  return cont;
}

function hideCurrentReplyBtn() {
  if (lastReplyId) {
    let lastReplyEl = document.getElementById('replyContBox' + lastReplyId);
    lastReplyEl.style.display = 'none';

    let card = document.getElementById('parent' + lastReplyId);
    if(card.style.height == '100px') {
      card.style.height = '80px';
    }
    else if(card.style.height == 'auto') {
      card.style.height = 'auto';
    }

    let oldBtn = document.getElementById('btn' + lastReplyId);
    oldBtn.style.display = '';
    let viewReply = document.getElementById('viewReply' + lastReplyId);
    viewReply.style.display = '';
  }
  lastReplyId = 0;
}
