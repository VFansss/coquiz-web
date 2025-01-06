export default class ContentRetriever {
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Normalize all line endings
                const normalizedContent = e.target.result
                .replace(/\r\n/g, '\n')  // Convert CRLF to LF
                .replace(/\r/g, '\n');   // Convert any single CR to LF
               
                resolve(normalizedContent);
            };
            reader.onerror = (e) => reject(e.target.error);
            reader.readAsText(file);
        });
    }
}