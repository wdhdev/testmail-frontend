const cookies = {
    apikey: Cookies.get("apikey") || "",
    namespace: Cookies.get("namespace") || "",
    tag: Cookies.get("tag") || ""
}

document.getElementById("apikey").setAttribute("value", String(cookies.apikey));
document.getElementById("namespace").setAttribute("value", String(cookies.namespace));
document.getElementById("tag").setAttribute("value", String(cookies.tag));
