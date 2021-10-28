document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  const form = document.querySelector("#compose-form");
  const recipients = document.querySelector("#recipients");
  const subject = document.querySelector("#subject");
  const body = document.querySelector("#body");


  form.onsubmit = () => {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: `${recipients.value}`,
        subject: `${subject.value}`,
        body: `${body.value}`
      })
    })

      .then(response => response.json())

      .then(() => {
        load_mailbox('sent');
      })

      .catch(error => {
        console.log('Error:', error);
      });

    return false;

  }


  function compose_email() {
    
    // Show compose view and hide other views
    document.querySelector('#emails').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#single-email').style.display = 'none';


    // Clear out composition fields
    document.querySelector('#recipients').value = '';
    document.querySelector('#subject').value = '';
    document.querySelector('#body').value = '';
  }

  function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#emails').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#single-email').style.display = 'none';

    const mail_container = document.createElement("main")

    mail_container.className = "mail_container"

    // Show the mailbox name
    document.querySelector('#emails').innerHTML = `<h3 class="mailbox-title">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


    // fetch all email in the current mailbox
    fetch(`/emails/${mailbox}`)

      .then(response => response.json())

      .then(emails => {

        emails.forEach(email => {

          const mail_item = document.createElement("div");
          mail_item.className = "mail_item";
          mail_item.classList.add("flex");

          if (email.read === true) {
            mail_item.style.backgroundColor = 'rgb(199, 199, 199)';
          }

          mail_item.innerHTML = `
          <div class="sender">${email.sender}</div> 
          <div class="subject">${email.subject}</div>
          <div class="timestamp">${email.timestamp}</div>`;

          mail_container.append(mail_item);
          document.querySelector('#emails').append(mail_container);

          mail_item.addEventListener("click", () => load_mail(`${email.id}`));

        });

      })

  }



  function load_mail(email_id) {

    document.querySelector('#emails').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#single-email').style.display = 'block';

    fetch(`/emails/${email_id}`)

      .then(response => response.json())

      .then(email => {

        document.querySelector("#single-email").innerHTML = `
        <div id="single_mail" class="flex">
          <div class="mail-sender">From: ${email.sender}</div> 
          <div class="mail-subject">${email.subject}</div>
          <div class="mail-body">${email.body}</div>
          <div class="mail-timestamp">${email.timestamp}</div>
          <hr>
            <div class="reply-archived flex button">
              <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-reply-all-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.079 11.9l4.568-3.281a.719.719 0 0 0 0-1.238L8.079 4.1A.716.716 0 0 0 7 4.719V6c-1.5 0-6 0-7 8 2.5-4.5 7-4 7-4v1.281c0 .56.606.898 1.079.62z"/>
              <path fill-rule="evenodd" d="M10.868 4.293a.5.5 0 0 1 .7-.106l3.993 2.94a1.147 1.147 0 0 1 0 1.946l-3.994 2.94a.5.5 0 0 1-.593-.805l4.012-2.954a.493.493 0 0 1 .042-.028.147.147 0 0 0 0-.252.496.496 0 0 1-.042-.028l-4.012-2.954a.5.5 0 0 1-.106-.699z"/>
              </svg>
              Reply 
            </div>`;

        const archived_button = document.createElement("div");
        archived_button.className = "reply-archived";
        archived_button.classList.add("flex");
        archived_button.classList.add("button");

        var to_archive = true;

        if (email.archived === true) {
          archived_button.innerHTML = `<svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-archive-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15h9.286zM6 7a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1H6zM.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8H.8z"/>
          </svg> Unarchive.`;

          to_archive = false;

        } else {
          archived_button.innerHTML = `<svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-archive-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15h9.286zM6 7a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1H6zM.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8H.8z"/>
          </svg> Archive`;
        }

        document.querySelector("#single_mail").append(archived_button);

        archived_button.addEventListener("click", () => archive_email(`${email.id}`, to_archive));

        const reply = document.querySelector(".reply-archived");
        reply.addEventListener("click", () => reply_email(`${email.sender}`, `Re:${email.subject}`, `On "${email.timestamp} ${email.sender} wrote:" ${email.body}`));
      });

    // when the user clicks on an email automatically set the read status to true
    fetch(`/emails/${email_id}`, {

      method: 'PUT',

      body: JSON.stringify({
        read: true
      })

    })

  }


  function archive_email(email_id, bool) {

    fetch(`/emails/${email_id}`, {

      method: 'PUT',
      body: JSON.stringify({
        archived: bool
      })

    })

    load_mailbox('inbox')

  }


  function reply_email(sender, subject, body) {

    // Show compose view and hide other views
    document.querySelector('#emails').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#single-email').style.display = 'none';


    // Clear out composition fields
    document.querySelector('#recipients').value = sender;
    document.querySelector('#subject').value = subject;
    document.querySelector('#body').value = body;

  }

})


