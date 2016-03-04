module.exports = {
  entry: {
    'ubt': './ubt/entry.js',
    'ubt-angular': './ubt-angular/entry.js',
    'ubt-without-pv': './ubt-without-pv/entry.js'
  },
  output: {
    filename: '[name].min.js',
    library: 'UBT'
  }
};
