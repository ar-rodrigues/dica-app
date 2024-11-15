// Convert file to base64
export const  convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });
};


// Convert Base64 to File
export const convertBase64ToFile = (base64String, fileName) => {
    const [metadata, data] = base64String.split(',');
    const mime = metadata.match(/:(.*?);/)[1]; // Extract MIME type

    const byteCharacters = atob(data); // Decode base64 data
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    return new File([byteArray], fileName, { type: mime });
};