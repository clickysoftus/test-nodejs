module.exports = file => {
  // Accept images only
  var filename = file.name.toLowerCase();
  //if (!file.name.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
  if (!filename.match(/\.(jpg|jpeg|png|gif)$/)) {
    return false;
  }
  return true;
};
