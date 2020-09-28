const generateLocation = (url) => {
    return {
        "url": url,
        "createdAt" : new Date().getTime(),
    }
}


module.exports = {
    generateLocation
}