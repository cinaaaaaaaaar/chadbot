class VideoGenerator {
  constructor(port) {
    this.url = `http://localhost:${port}`;
  }
  async curb_your_enthusiasm(url, duration) {
    const path = await this.getResponse("/curb_your_enthusiasm", { url, duration });
    return path;
  }
  async average(text) {
    const path = await this.getResponse("/average", { text1: text[0], text2: text[1] });
    return path;
  }
  async getResponse(endpoint, data) {
    const response = await fetch(this.url + endpoint, {
      method: "POST",
      headers: data,
    });
    const { path } = await response.json();
    return path;
  }
}
module.exports = VideoGenerator;
