

const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY
const pinataSecretApiKey = process.env.REACT_APP_PINATA_SECRET_API_KEY
const ipfsApi = "https://api.pinata.cloud/" + "pinning/pinFileToIPFS"

export const uploadFileToIfps = (image: File) => {
    let headers = new Headers();
    headers.append("pinata_api_key", pinataApiKey)
    headers.append("pinata_secret_api_key", pinataSecretApiKey)
    const formData = new FormData();
    formData.append('file', image);

    const options = {
        method: 'POST',
        body: formData,
        headers: headers
    };

    return fetch(ipfsApi, options).then(res => res.json());
}
