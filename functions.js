const sender = [];
const subject = [];
const body = [];

const div = document.getElementById("data");

async function toggleAPIKeyView() {
    const button = document.getElementById("apikey");

    if(button.type == "password") {
        document.getElementById("apikey-btn").innerHTML = "Hide API Key";
        document.getElementById("apikey").setAttribute("type", "text");
    } else {
        document.getElementById("apikey-btn").innerHTML = "Show API Key";
        document.getElementById("apikey").setAttribute("type", "password");
    }
}

async function formatDate(timestamp) {
    return moment.unix(timestamp / 1000).format("Do MMMM YYYY, h:mma");
}

function getSender(email) {
    const senderName = email.from_parsed[0].name;
    const senderEmail = email.from_parsed[0].address;

    if(!senderName) return senderEmail;

    return `${senderName} (${senderEmail})`;
}

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return "0B";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}${sizes[i]}`;
}

async function fetchMail(apikey, namespace, tag) {
    if(!apikey.length === 36) return div.append("Please enter a valid API key.");

    div.innerHTML = "Loading emails...";

    let request = await fetch(`https://api.testmail.app/api/json?apikey=${apikey}&namespace=${namespace}&tag=${tag}&livequery=true`, { credentials: "omit" });

    if(request.status != 200) return div.innerHTML = (await request.json()).message;

    request = await request.json();

    if(request.count === 0) return div.innerHTML = "There are no emails on the server.";

    div.innerHTML = "";

    for (const email of request.emails) {
        const mailDate = await formatDate(email.date);

        const sender = getSender(email);

        const mailElement = document.createElement("div");
        mailElement.classList = "p-4 w-max bg-zinc-800 mb-4 rounded-md";
        div.appendChild(mailElement);

        mailElement.innerHTML = `${mailElement.innerHTML}<div><a class="text-blue-500 hover:text-blue-600" href="${email.downloadUrl}"><i class="fa-solid fa-download"></i> Download</a><br>`;
        mailElement.innerHTML = `${mailElement.innerHTML}<div><span class="font-semibold">Received</span>: ${mailDate}</div>`;
        mailElement.innerHTML = `${mailElement.innerHTML}<div><span class="font-semibold">From</span>: <a class="text-blue-500 hover:text-blue-600" href="mailto:${email.from_parsed[0].address}">${sender}</a></div>`;
        mailElement.innerHTML = `${mailElement.innerHTML}<div><span class="font-semibold">Subject</span>: ${email.subject ?? '<span class="italic">No subject</span>'}</div>`;
        mailElement.innerHTML = `${mailElement.innerHTML}<div><span class="font-semibold">Body</span>: ${email.text ?? '<span class="italic">No body</span>'}</div>`;

        if(email.attachments) {
            mailElement.innerHTML = `${mailElement.innerHTML}<div>${email.attachments.map(a => `<a class="text-blue-500 hover:text-blue-600 mr-2" href="${a.downloadUrl}"><i class="fa-solid fa-paperclip text-gray-400"></i> ${a.filename} <span class="text-small text-gray-400">(${formatBytes(a.size.toString())})</span></a>`)}</div>`;
        }
    }
}

async function fetchData() {
    div.replaceChildren();

    await fetchMail(document.getElementById("apikey").value, document.getElementById("namespace").value, document.getElementById("tag").value);

    Cookies.set("apikey", document.getElementById("apikey").value, { sameSite: "strict", path: "" });
    Cookies.set("namespace", document.getElementById("namespace").value, { sameSite: "strict", path: "" });
    Cookies.set("tag", document.getElementById("tag").value, { sameSite: "strict", path: "" });
}
