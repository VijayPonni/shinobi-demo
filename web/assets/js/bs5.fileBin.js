$(document).ready(function(e){
    //Timelapse JPEG Window
    var theEnclosure = $('#tab-fileBinView')
    var monitorsList = theEnclosure.find('.monitors_list')
    var dateSelector = theEnclosure.find('.date_selector')
    var fileBinDrawArea = $('#fileBin_draw_area')
    var fileBinPreviewArea = $('#fileBin_preview_area')
    var loadedVideosInMemory = {};
    function openFileBinView(monitorId,startDate,endDate){
        drawFileBinViewElements(monitorId,startDate,endDate)
    }
    function getSelectedTime(asUtc){
        var dateRange = dateSelector.data('daterangepicker')
        var startDate = dateRange.startDate.clone()
        var endDate = dateRange.endDate.clone()
        if(asUtc){
            startDate = startDate.utc()
            endDate = endDate.utc()
        }
        startDate = startDate.format('YYYY-MM-DDTHH:mm:ss')
        endDate = endDate.format('YYYY-MM-DDTHH:mm:ss')
        return {
            startDate: startDate,
            endDate: endDate
        }
    }

    dateSelector.daterangepicker({
        startDate: moment().utc().subtract(2, 'days'),
        endDate: moment().utc(),
        timePicker: true,
        locale: {
            format: 'YYYY/MM/DD hh:mm:ss A'
        }
    }, function(start, end, label) {
        drawFileBinViewElements()
    })
    monitorsList.change(function(){
        drawFileBinViewElements()
    })
    function drawFileBinViewElements(selectedMonitor,startDate,endDate){
        var dateRange = getSelectedTime(false)
        if(!startDate)startDate = dateRange.startDate
        if(!endDate)endDate = dateRange.endDate
        if(!selectedMonitor)selectedMonitor = monitorsList.val()
        var queryString = ['start=' + startDate,'end=' + endDate,'limit=0']
        var frameIconsHtml = ''
        var apiURL = getApiPrefix('fileBin') + '/' + selectedMonitor;
        var fileBinData = []
        loadedVideosInMemory = {}
        $.getJSON(apiURL + '?' + queryString.join('&'),function(data){
            fileBinDrawArea.bootstrapTable('destroy')
            fileBinDrawArea.bootstrapTable({
                pagination: true,
                search: true,
                columns: [
                      {
                        field: 'name',
                        title: lang['Filename']
                      },
                      {
                        field: 'time',
                        title: lang['Time Created']
                      },
                      {
                        field: 'buttons',
                        title: 'Download'
                      }
                ],
                data: data.files.map((file) => {
                    return {
                        name: file.name,
                        time: file.time,
                        buttons: `
                            <a class="btn btn-sm btn-primary" href="${file.href}" download title="${lang.Download}"><i class="fa fa-download"></i></a>
                            ${file.details.video ? `<a class="btn btn-sm btn-primary preview-video" href="${file.href}" title="${lang.Play}"><i class="fa fa-play"></i></a>` : ``}
                        `,
                    }
                })
            })
        })
    }

    $('body')
    .on('click','.open-fileBin-viewer',function(){
        var el = $(this).parents('[data-mid]')
        var monitorId = el.attr('data-mid')
        openTab(`fileBinView`,{},null)
        monitorsList.val(monitorId).change()
    });
    theEnclosure
    .on('click','.preview-video',function(e){
        e.preventDefault()
        var href = $(this).attr('href')
        fileBinPreviewArea.html(`<video class="video_video" style="width:100%" autoplay controls preload loop src="${href}"></video>`)
        return false;
    })
    addOnTabOpen('fileBinView', function () {
        drawMonitorListToSelector(monitorsList)
        drawFileBinViewElements()
    })
    addOnTabReopen('fileBinView', function () {
        var theSelected = `${monitorsList.val()}`
        drawMonitorListToSelector(monitorsList)
        monitorsList.val(theSelected)
    })
    addOnTabAway('fileBinView', function () {
        fileBinPreviewArea.find('video')[0].pause()
    })
})