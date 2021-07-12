var doc = new jsPDF();

$('#btnDownload').click(function () {
    doc.fromHTML($('#category').html(), 15, 15, {
        'width': 170
    });
    doc.save('sample-file.pdf');
});