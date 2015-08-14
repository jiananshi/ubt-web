module.exports = {
  entry: {
    'ubt': './ubt/entry.js',
    'ubt-angular': './ubt-angular/entry.js'
  },
  output: {
    filename: '[name].min.js',
    library: 'UBT'
  }
};
