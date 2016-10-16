var b = function(i, j, t) {
    return ( i + (j - i) * t) ;
}
  , ib = function(i, j, b) {
    return ((i - j) == 0) ? i : ((i - b) / (i - j));
}
  , repeat = function(n, f) {
    for (var i = 0; i < n; i++)
        f.call(this, i);
}