const body = document.querySelector('body');
let mainCurrentPage = 1;
const limit = 2;
let allPosts = [];

function userLogin(status) {
  body.innerHTML =  `
  <p class="status">Status: ${status}</p>

  <ol>
    <li><button class="one">ONE</button></li>
    <br><br>
    <li>
      <form action="http://localhost:8080/feed/post" method="POST">
        <label for="title">Title</label>
        <input class="title" type="text" name="title" id="title"><br>

        <label for="content">Content</label>
        <input class="content" type="text" name="content" id="content"><br>

        <input type="file" name="image" class="image1"><br>

        <button type="button" class="two">TWO</button>
      </form>
    </li>
    <br><br>
    <li>
      <form>
        <label for="postId">PostId</label>
        <input class="postId" type="number" id="postId" name="postId"><br>
      </form>
      <button class="three">THREE</button>
    </li>
    <br><br>
    <li>
      <form>
        <label for="postIdForUpdate">PostIdForUpdate</label>
        <input class="postIdForUpdate" type="number" id="postIdForUpdate" name="postIdForUpdate"><br>

        <label for="newTitle">New Title</label>
        <input class="newTitle" type="text" name="newTitle" id="newTitle"><br>

        <label for="newContent">New Content</label>
        <input class="newContent" type="text" name="newContent" id="newContent"><br>

        <input type="file" name="image" class="image2"><br>
      </form>
      <button class="four">FOUR</button>
    </li>
    <br><br>
    <li>
      <form>
        <label for="deletePost">IdForDeletePost</label>
        <input type="number" id="deletePost" class="postIdForDelete" name="idForDeletePost">
      </form>
      <button class="five">FIVE</button>
    </li>
    <br><br>
    <li>
      <form>
        <label for="newStatus">New Status</lable>
        <input type="text" name="newStatus" class="newStatus" id="newStatus">
      </form>
      <button class="six" type="button">SIX</button>
    </li>
  </ol>

  <button class="logout">Logout</button>

  <div>RESULT:
    <div class="root"></div>
  </div>

  <div class="paginationButtons"></div>

  <div class="paginationPosts"></div>
  
  <div>ERRORS: 
    <div class="errors"></div>
  </div>

  <button class="clean">cLEAN</button>

  <script src="./script.js"></script>
  `;
}

function userNotLogin() {
  localStorage.removeItem('token');
  body.innerHTML = `
  <ol>
    <li>
      <form>
        <label for="name">Name</label>
        <input class="name" type="text" name="name" id="name"><br>

        <label for="email">Email</label>
        <input class="email" type="email" name="email" id="email"><br>

        <label for="password">Password</label>
        <input class="password" type="password" name="password" id="password"><br>

        <label for="confirmPassword">Confirm Password</label>
        <input class="confirmPassword" type="password" name="confirmPassword" id="confirmPassword"><br>
      </form>
      <button type="button" class="signup">Signup</button>
    </li>
    <br><br>
    <li>
      <form>
        <label for="emailForLogin">Email</label>
        <input class="emailForLogin" type="email" name="emailForLogin" id="emailForLogin"><br>

        <label for="passwordForLogin">Password</label>
        <input class="passwordForLogin" type="password" name="passwordForLogin" id="passwordForLogin"><br>
      </form>
      <button type="button" class="login">Login</button>
    </li>
  </ol>

  <div>RESULT:
    <div class="root"></div>
  </div>

  <div>ERRORS: 
    <div class="errors"></div>
  </div>

  <button class="clean">cLEAN</button>

  <script src="./script.js"></script>
  `;
};

function valueNotImg(value, isValid) {
  const p = document.createElement('p');
  p.textContent = value;

  if(isValid) {
    p.style = 'font-size: 12px; color: lime;';
    const root = document.querySelector('.root');
    root.appendChild(p);
  } else {
    p.style = 'font-size: 15px; color: red;';
    const errors = document.querySelector('.errors');
    errors.appendChild(p);
  };
};

function valueForImg(data, src, alt, textContent, otherContainer=false) {
  const p = document.createElement('p');
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  p.textContent = textContent;
  p.appendChild(img);
  p.style = 'font-size: 12px; color: lime;';
  console.log(p);

  if(otherContainer) {
    otherContainer.appendChild(p);
  } else {
    const root = document.querySelector('.root');
    root.appendChild(p);
  };
};


document.addEventListener('DOMContentLoaded', e => {
  const token = localStorage.getItem('token');
  console.log('token in localSorage', token);

  if(token) {
    fetch('http://localhost:8080/feed/my', {
      headers: {
        // если token есть отправить 'Bearer ' + токен а если нету пустую строку что бы мидлевар is-auth выдал ошибку 401 Not authenticated.
        'Authorization': (token)?("Bearer " + token):(''),
      }
    })
    .then(data=>data.json())
    .then(data => {
      console.log(data);

      if(data.result === "Срок действия jwt токена истек.") {
        userNotLogin();
      } else {
        const { user } = data;
        
        userLogin(user.status);
      }
    })
    .catch(err=>console.log(err));
  } else {
    userNotLogin();
  };
});

body.addEventListener('click', e => {
  if(e.target.closest('.one')) {
    const token = localStorage.getItem('token') || '';

    fetch('http://localhost:8080/feed/posts', {
      headers: {
        // если token есть отправить 'Bearer ' + токен а если нету пустую строку что бы мидлевар is-auth выдал ошибку 401 Not authenticated.
        'Authorization': (token)?("Bearer " + token):('')
      }
    })
      .then(data => data.json())
      .then(data => {
        console.log(data);
        console.log(data);

        if(data.result === 'Срок действия jwt токена истек.') {
          userNotLogin();
        } else if(data.msg === 'postsNotFound') {
          valueNotImg(data.message, true);
        } else if(data.type === 'text') {
          valueNotImg(data.result, false);
        } else {
          allPosts = data;
          mainCurrentPage = 1;
          const errors = document.querySelector('.errors');
          errors.innerHTML = '';

          function renderPosts(allPosts, currentPage) {
            const start = (currentPage-1) * limit;
            const end = start + limit;
            const currentValues = allPosts.slice(start, end);

            const paginationContainerPosts = document.querySelector('.paginationPosts');
            paginationContainerPosts.innerHTML = '';

            console.log(start, end, allPosts, currentValues);

            for(const el of currentValues) {
              console.log(el);
              valueForImg(el, `http://localhost:8080/${decodeURIComponent(el.image_url)}`, el.title, `id: ${el.id}, title: ${el.title}, content: ${el.content}, image_url: ${el.image_url}, creator_name: ${el.name}, creaor_email: ${el.email}, creator_password: ${el.password}, creator_status: ${el.status}, createdAt: ${el.created_at}`, paginationContainerPosts);
            };
          };

          function renderButtons(allPosts, currentPage) {
            const paginationContainerButtons = document.querySelector('.paginationButtons');
            paginationContainerButtons.innerHTML = '';

            const countButtons = Math.ceil(allPosts.length/limit);
            console.log(countButtons, currentPage);

            const afterPage = currentPage + 1;
            const beforePage = currentPage - 1;

            let firstPage = lastPage = otherPage = afterPageNotEqualLastPage = beforePageNotEqual1 = false;

            if(currentPage === 1) {
              firstPage = true;
              afterPageNotEqualLastPage = true;
            } else if(countButtons === currentPage) {
              beforePageNotEqual1 = true;
              lastPage = true;
            } else {
              beforePageNotEqual1 = true;
              otherPage = true;
              afterPageNotEqualLastPage = true;
            };

            console.log(countButtons, afterPage, beforePage, firstPage, lastPage, otherPage, afterPageNotEqualLastPage, beforePageNotEqual1);

            function renderButtonsByArray(notMainCurrentPage, array) {
              console.log(notMainCurrentPage, array);

              let i = notMainCurrentPage;
              for (const el of array) {
                const button = document.createElement('button');
                
                let targetPageNumber;
                if(el === 'beforePage') {
                  targetPageNumber = notMainCurrentPage-1;
                } else if(el === 'page') {
                  targetPageNumber = notMainCurrentPage;
                } else {
                  targetPageNumber = notMainCurrentPage+1;
                };

                button.textContent = 'Страница номер ' + targetPageNumber;
                button.dataset.id = targetPageNumber;

                if(targetPageNumber === notMainCurrentPage) {
                  button.style = 'color: aqua; background-color: brown';
                };

                button.addEventListener('click', e => {
                  mainCurrentPage = +button.dataset.id;
                  console.log('cunretPgae', mainCurrentPage, i);
                  renderButtons(allPosts, mainCurrentPage);
                  renderPosts(allPosts, mainCurrentPage);
                });

                paginationContainerButtons.appendChild(button);
                i++;
              };
            };

            if(firstPage) {
              if(afterPageNotEqualLastPage) {
                renderButtonsByArray(currentPage, ['page', 'afterPage']);
              } else {
                renderButtonsByArray(currentPage, ['page']);
              }
            } else if(lastPage) {
              if(beforePageNotEqual1) {
                renderButtonsByArray(currentPage, ['beforePage', 'page']);
              } else {
                renderButtonsByArray(currentPage, ['page']);
              };
            } else {
              if(beforePageNotEqual1 && afterPageNotEqualLastPage) {
                renderButtonsByArray(currentPage, ['beforePage', 'page', 'afterPage']);
              } else if(beforePageNotEqual1) {
                renderButtonsByArray(currentPage, ['beforePage', 'page']);
              } else if(afterPageNotEqualLastPage) {
                renderButtonsByArray(currentPage, ['page', 'afterPage']);
              } else {
                renderButtonsByArray(currentPage, ['page']);
              };
            };
          };

          renderButtons(allPosts, mainCurrentPage);
          renderPosts(allPosts, mainCurrentPage);
        };
      })
      .catch(err => console.log(err));
  } else if(e.target.closest('.two')) {
    e.preventDefault();

    const titleInput = document.querySelector('.title');
    const contentInput = document.querySelector('.content');
    const imageInput1 = document.querySelector('.image1');
    const token = localStorage.getItem('token') || '';

    const formData = new FormData();
    
    formData.append('title', titleInput.value);
    formData.append('content', contentInput.value);
    
    if (imageInput1.files[0]) {
      formData.append('image', imageInput1.files[0]);
    } else {
      const errors = document.querySelector('.errors');
      errors.innerHTML = '<p style="font-size: 15px; color: red;">Пожалуйста, выберите файл</p>';
      return;
    };
    
    fetch('http://localhost:8080/feed/post', {
      method: "POST",
      body: formData,
      headers: {
        // если token есть отправить 'Bearer ' + токен а если нету пустую строку что бы мидлевар is-auth выдал ошибку 401 Not authenticated.
        'Authorization': (token)?("Bearer " + token):('')
      }
    })
    .then(data => data.json())
    .then(data => {
      console.log(data);

      const errors = document.querySelector('.errors');
      errors.innerHTML = '';

      if(data.error) {
        for (const err of data.errors) {
          valueNotImg(`Ошибка в ${err.value}, сообщение: ${err.msg}`, false);
        };
      } else if(data.type === 'text') {
        valueNotImg(data.result, false);
      } else {
        valueForImg(data, `http://localhost:8080/${decodeURIComponent(data.post.image_url)}`, data.post.title, `message: ${data.message}, id: ${data.post.id}, title: ${data.post.title}, content: ${data.post.content}, image_url: ${data.post.image_url}, creator_name: ${data.post.name}, creaor_email: ${data.post.email}, creator_password: ${data.post.password}, creator_status: ${data.post.status}, createdAt: ${data.post.created_at}`);
        
        titleInput.value = contentInput.value = '';
      };
    })
    .catch(err => console.log(err));
  } else if(e.target.closest('.three')) {
    const postIdInput = document.querySelector('.postId');
    const token = localStorage.getItem('token') || '';

    const postId = postIdInput.value;
    console.log(`http://localhost:8080/feed/post/${postId}`);

    fetch(`http://localhost:8080/feed/post/${postId}`, {
      headers: {
        // если token есть отправить 'Bearer ' + токен а если нету пустую строку что бы мидлевар is-auth выдал ошибку 401 Not authenticated.
        'Authorization': (token)?("Bearer " + token):('')
      }
    })
      .then(data=>data.json())
      .then(data => {
        console.log(data);

        if(data.error && data.type === 'postNotFound') {
          valueNotImg(`message: ${data.message}`, false);
        } else if(data.type ==='text') {
          valueNotImg(data.result, false);
        } else {
          const errors = document.querySelector('.errors');
          errors.innerHTML = '';

          valueForImg(data, `http://localhost:8080/${decodeURIComponent(data.image_url)}`, data.title, `id: ${data.id}, title: ${data.title}, content: ${data.content}, image_url: ${data.image_url}, creatorUserId: ${data.creator_user_id}, createdAt: ${data.created_at}`);
        };
      })
      .catch(err=>console.log(err));
  } else if(e.target.closest('.four')) {
    const newTitleInput = document.querySelector('.newTitle');
    const newContentInput = document.querySelector('.newContent');
    const imageInput2 = document.querySelector('.image2');
    const postIdForUpdateInput = document.querySelector('.postIdForUpdate');

    const postId = postIdForUpdateInput.value;
    const token = localStorage.getItem('token') || '';
    const formData = new FormData();

    if(postId) {
      formData.append('title', newTitleInput.value);
      formData.append('content', newContentInput.value);
      formData.append('image', imageInput2.files[0]);

      fetch(`http://localhost:8080/feed/post/${postId}`, {
        method: "PUT",
        body: formData,
        headers: {
          // если token есть отправить 'Bearer ' + токен а если нету пустую строку что бы мидлевар is-auth выдал ошибку 401 Not authenticated.
          'Authorization': (token)?("Bearer " + token):('')
        }
      })
      .then(data=>data.json())
      .then(data => {
        console.log(data);
        console.log(data);
        console.log(data);

        const errors = document.querySelector('.errors');
        errors.innerHTML = '';

        if(data.error) {
          for (const err of data.errors) {
            valueNotImg(`Ошибка в ${err.value}, сообщение: ${err.msg}`, false);
          };
        } else if(data.error && data.type === 'postNotFound') {
          valueNotImg(`message: ${data.message}`, false);
        } else if(data.type === 'text') {
          valueNotImg(data.result, false);
        } else {
          newTitleInput.value = newContentInput.value = imageInput2.value = postIdForUpdateInput.value = '';
          valueForImg(data, `http://localhost:8080/${decodeURIComponent(data.post.image_url)}`, data.post.title, `message: ${data.message}, id: ${data.post.id}, title: ${data.post.title}, content: ${data.post.content}, image_url: ${data.post.image_url}, creator_name: ${data.post.name}, creaor_email: ${data.post.email}, creator_password: ${data.post.password}, creator_status: ${data.post.status}, createdAt: ${data.post.created_at}`);
        }
      })
      .catch(err => console.log(err));
    } else {
      valueNotImg('Вы не выбрали id пользователя который хотите изменить.', false);
    }
  } else if(e.target.closest('.five')) {
    const postIdForDeleteInput = document.querySelector('.postIdForDelete');

    const postId = postIdForDeleteInput.value;
    const token = localStorage.getItem('token') || '';

    fetch(`http://localhost:8080/feed/post/${postId}`, {
      method: "DELETE",
      headers: {
        // если token есть отправить 'Bearer ' + токен а если нету пустую строку что бы мидлевар is-auth выдал ошибку 401 Not authenticated.
        'Authorization': (token)?("Bearer " + token):('')
      }
    })
    .then(data=>data.json())
    .then(data => {
      console.log(data);

      const errors = document.querySelector('.errors');
      errors.innerHTML = '';

      if(data.error && data.type === 'postNotFound') {
        valueNotImg(`message: ${data.message}`, false);
        return;
      } else if(data.type === 'text') {
        valueNotImg(data.result, false);
      } else {
        valueNotImg(data.message, true);
      };
    })
    .catch(err=>console.log(err));
  } else if(e.target.closest('.six')) {
    const newStatusInput = document.querySelector('.newStatus');
    const token = localStorage.getItem('token') || '';

    const newStatus = newStatusInput.value;

    fetch('http://localhost:8080/feed/status', {
      method: "POST",
      headers: {
        // если token есть отправить 'Bearer ' + токен а если нету пустую строку что бы мидлевар is-auth выдал ошибку 401 Not authenticated.
        'Authorization': (token)?("Bearer " + token):(''),
        'Content-Type': "application/json"
      },
      body: JSON.stringify({ newStatus })
    })
    .then(data=>data.json())
    .then(data => {
      console.log(data);
      
      if(data.type === 'text') {
        valueNotImg(data.result, false);
      } else {
        newStatusInput.value = '';
        const statusP = document.querySelector('.status');
        statusP.innerHTML = `Status: ${data.newStatus}`;
      };
    })
    .catch(err=>console.log(err));
  } else if(e.target.closest('.signup')) {
    const token = localStorage.getItem('token') || '';
    const nameInput = document.querySelector(".name");
    const emailInput = document.querySelector(".email");
    const passwordInput = document.querySelector(".password");
    const confirmPasswordInput = document.querySelector(".confirmPassword");

    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    console.log(name, email, password, confirmPassword);

    const errors = document.querySelector('.errors');
    errors.innerHTML = '';
    if(password !== confirmPassword) {
      valueNotImg('message: Пароли не совпадают.', false);
    } else {
      fetch('http://localhost:8080/auth/signup', {
        method: "POST",
        headers: {
          'Content-Type': "application/json",
          // если token есть отправить 'Bearer ' + токен а если нету пустую строку что бы мидлевар is-auth выдал ошибку 401 Not authenticated.
          'Authorization': (token)?("Bearer " + token):('')
        },
        body: JSON.stringify({ name, email, password })
      })
      .then(data=>data.json())
      .then(data => {
        console.log(data);

        if(data.error) {
          for (const err of data.errors) {
            valueNotImg(`Ошибка в ${err.value}, сообщение: ${err.msg}`, false);
          };
          return;
        } else if(data.type === 'text') {
          valueNotImg(data.result, false);
        } else {
          nameInput.value = emailInput.value = passwordInput.value = confirmPasswordInput.value = '';
          userLogin();

          valueNotImg(`message: ${data.message}, userId: ${data.userId}`, true);
        }
      })
      .catch(err=>console.log(err));
    };
  } else if(e.target.closest('.login')) {
    const token = localStorage.getItem('token');
    const emailForLoginInput = document.querySelector(".emailForLogin");
    const passwordForLoginInput = document.querySelector(".passwordForLogin");
  
    const email = emailForLoginInput.value;
    const password = passwordForLoginInput.value;
    console.log(email, password);

    fetch('http://localhost:8080/auth/login', {
      method: "POST",
      headers: {
        'Content-Type': "application/json",
        // если token есть отправить 'Bearer ' + токен а если нету пустую строку что бы мидлевар is-auth выдал ошибку 401 Not authenticated.
        'Authorization': (token)?("Bearer " + token):('')
      },
      body: JSON.stringify({ email, password })
    })
    .then(data=>data.json())
    .then(data => {
      console.log(data);

      const errors = document.querySelector('.errors');
      errors.innerHTML = '';

      if(data.error) {
        for (const err of data.errors) {
          valueNotImg(`Ошибка в ${err.value}, сообщение: ${err.msg}`, false);
        };
      } else if(data.type === 'text') {
        valueNotImg(data.result, false);
      } else {
        emailForLoginInput.value = passwordForLoginInput.value = '';
        userLogin(data.user.status);
        localStorage.setItem('token', data.token);

        valueNotImg('Вы зашли в аккаунт пользователя с id: ' + data.user.id, true);
      };
    })
    .catch(err=>console.log(err));
  } else if(e.target.closest('.logout')) {
    userNotLogin();
  } else if(e.target.closest('.clean')) {
    const paginationContainerButtons = document.querySelector('.paginationButtons');
    const paginationContainerPosts = document.querySelector('.paginationPosts');
    const root = document.querySelector('.root');
    const errors = document.querySelector('.errors');
    
    root.innerHTML = '';
    errors.innerHTML = '';
    paginationContainerButtons.innerHTML = '';
    paginationContainerPosts.innerHTML = '';
  };
});
