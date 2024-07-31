courses = {};

function slotexpand(slotnames) {
    slotnames = slotnames.replace(/[\s]/ig, "").toUpperCase().replace("LX", "Lx");
    var finalslots = [];
    var slotlist = slotnames.split(/[;,]/ig);
    for (i in slotlist) {
        var currslot = slotlist[i]; 
        switch (currslot) {
            case "1":
            case "2":
            case "3":
            case "4":
                finalslots = finalslots.concat([currslot + "A", currslot + "B", currslot + "C"]);
                break;
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
            case "10":
            case "11":
            case "12":
            case "13":
            case "14":
            case "15":
                finalslots = finalslots.concat([currslot + "A", currslot + "B"]);
                break;
            default:
                finalslots.push(currslot);
        }
    }
    return finalslots;
}

function addCourse(coursename, slots, venue, color) {
    console.log(color);
    var eslots = slotexpand(slots);

    var slotid = coursename + "-" + eslots.join("-");
    slotid = "i-" + slotid.replace(/[^A-Za-z0-9\-\_\:\.]/ig, '-');
    courses[slotid] = { "name": coursename, "slots": eslots, "venue": venue, "color": color };

    for (var aslot in eslots) {
        if ($('.slot-' + eslots[aslot]).length <= 0) {
            alert("Slot " + eslots[aslot] + " does not exist");
            return false;
        }
    }

    for (var aslot in eslots) {
        eslots[aslot] = new String(eslots[aslot]);
        if ($('.slot-' + eslots[aslot] + '.used').length > 0 || $('.slot-clash-' + eslots[aslot] + '.used').length > 0) {
            var arr = $('.slot-' + eslots[aslot] + '.used,.slot-clash-' + eslots[aslot] + '.used').map(function () {
                return $(this).find('.slot-name').html() + " (" + $(this).find('.course-name').html() + ")"
            }).get();
            var arr2 = $('.slot-' + eslots[aslot] + '.used,.slot-clash-' + eslots[aslot] + '.used').map(function () {
                return $(this).find('.course-name').html()
            }).get();
            $('.course-name').each(function () {
                if (arr2.indexOf(this.innerHTML) != -1) {
                    $(this).parents(".used").addClass('softDanger')
                }
            });
            $('.slot-' + eslots[aslot] + '.used,.slot-clash-' + eslots[aslot] + '.used').addClass('dangerRem').removeClass("softDanger");
            eslots[aslot].nooverwrite = !confirm("Slot clash of " + eslots[aslot] + " with " + arr.join(", ") + ", overwrite other course or cancel this one?");
            $('.used').removeClass('dangerRem').removeClass('softDanger');
            if (!eslots[aslot].nooverwrite) {
                $('.slot-' + eslots[aslot] + '.used,.slot-clash-' + eslots[aslot] + '.used').each(function () { $('.rmslot[data-slotid=' + $(this).data('slotid') + ']').click() });
            } else {
                delete courses[slotid];
                return true;
            }
        }
    }

    for (var aslot in eslots) {
        console.log(eslots[aslot] + " " + eslots[aslot].overwrite);
        if (!eslots[aslot].nooverwrite) {
            showSlot(eslots[aslot], true, color);
            var $slot = $('.slot-' + eslots[aslot]);
            $slot.find('.course-name').html(coursename);
            $slot.find('.course-venue').html(venue);
            $slot.data('slotid', slotid);
            $slot.append('<button class="remove-instance btn btn-danger" data-slot="' + eslots[aslot] + '" style="position: relative; top: 0; right: 0; font-size: 12px; padding: 2px 5px; width: 20px; height: 20px;">x</button>');
        }
    }

    $('<tr id="list-' + slotid + '"><td><button type="button" class="btn btn-default btn-xs list-' + slotid + ' " id="color-button-' + slotid + '"><span class="glyphicon glyphicon-pencil"></span></button></td><td id="list-name-' + slotid + '">' + coursename + '</td><td><button class="rmslot btn-xs btn btn btn-danger" data-slotid="' + slotid + '">x</button></td></tr>').appendTo('#listb');
    $('#color-button-' + slotid).attr('style', 'background-color:' + color + ' !important')
        .colorpicker({ format: "rgba", color: color }).on('changeColor', function(ev) {
            var rgbc = ev.color.toRGB();
            var rgbc_str = "rgba(" + rgbc.r + "," + rgbc.g + "," + rgbc.b + ",0.36)";
            courses[slotid].color = rgbc_str;
            for (var aslot in eslots) {
                if (!eslots[aslot].nooverwrite) {
                    $('.slot-' + eslots[aslot]).attr('style', 'background-color:' + rgbc_str + ' !important');
                }
            }
            updatePerma();
            $('#color-button-' + slotid).attr('style', 'background-color:' + rgbc_str + ' !important');
        });
    updatePerma();
    $("#inputrow input:not(#color)").val("");
}


function updatePerma() {
    $('#perma').attr('href', '?timetable=' + encodeURIComponent(btoa(JSON.stringify(courses))) + "&slots=" + $('#snametog').hasClass('active'));
    return $('#perma').attr('href');
}

function showSlot(slotname, use, color) {
    $('.slot-' + slotname).show();
    if (use) {
        $('.slot-' + slotname).attr('style', 'background-color:' + color + ' !important')
            .addClass('used');
    }
    $('.clashbuddy-' + slotname).show();
    $('.slot-clash-' + slotname).hide();
}

function hideSlot(slotname, unuse) {
    if (unuse) {
        $('.slot-' + slotname).removeClass('used')
            .attr('style', 'background-color:white !important');
    }

    if ($('.clashbuddy-' + slotname + ".used").length == 0 && $('.clashbuddy-' + slotname).length != 0) {
        $('.slot-' + slotname).hide();
        $('.clashbuddy-' + slotname).hide();
        $('.slot-clash-' + slotname).show();
    }
}

function toggleSlot() {
    $('#snametog').toggleClass('active');
    if ($('#snametog').hasClass('active')) {
        $('.slot-name').show();
        $('#snametog').html('Hide slot names');
    } else {
        $('.slot-name').hide();
        $('#snametog').html('Show slot names');
    }
    $('#snametog').blur();
    updatePerma();
}

function getJsonFromUrl() {
    var query = location.search.substr(1);
    var data = query.split("&");
    var result = {};
    for (var i = 0; i < data.length; i++) {
        var item = data[i].split("=");
        result[item[0]] = item[1];
    }
    return result;
}

$(document).ready(function() {
    $('#listb').on('click', '.rmslot', function() {
        console.log('clicked');
        var slotid = $(this).data('slotid');
        slotid = slotid.replace(/\s/ig, '-');

        // Debug: Check if slotid is correct
        console.log('Slot ID:', slotid);

        var slots = courses[slotid]?.slots;

        if (slots) {
            for (var i in slots) {
                var $slot = $('.slot-' + slots[i]);

                // Debug: Check if $slot is found
                console.log('Slot:', $slot);

                if ($slot.length) {
                    $slot.find('.course-name').html(""); // Clear course name
                    $slot.find('.course-venue').html(""); // Clear course venue
                    $slot.removeClass('used'); // Remove the used class
                    $slot.css('background-color', 'white'); // Set background color to white
                }
            }

            // Debug: Check if color picker exists before destroying
            var $colorPicker = $('.list-' + slotid);
            if ($colorPicker.length) {
                $colorPicker.colorpicker('destroy');
            }

            $('#list-' + slotid).remove(); // Remove list item
            delete courses[slotid]; // Remove slot from courses object

            // Debug: Check if courses object is updated
            console.log('Updated Courses:', courses);

            updatePerma(); // Call the function to update the state
        } else {
            console.error('Slots not found for:', slotid);
        }
    });
    

    $('#table-btech').on('click', '.remove-instance', function() {
		console.log('Cross button clicked');
	
		var slotname = $(this).data('slot').toString().trim(); 
		var $slot = $(this).closest('.slot-' + slotname);
	
		if ($slot.length === 0) {
			console.error('Slot not found for slot name:', slotname);
			return;
		}
	
		var slotid = $slot.data('slotid');
		var course = courses[slotid];
	
		if (!course) {
			console.error('Course not found for slot ID:', slotid);
			return;
		}
	
		var slots = course.slots.map(slot => slot.toString().trim());
		console.log('Slots array:', slots);
	
		var index = slots.indexOf(slotname);
		console.log('Index in slots:', index);
	
		if (index !== -1) {
			var slotClass = 'slot-' + slotname;
			var originalColor = getSlotColor(slotClass);
			$slot.find('.course-name').html("");
			$slot.find('.course-venue').html("");
			$slot.attr('style', 'background-color:' + originalColor + ' !important');
	
			if (slots.length === 0) {
				delete courses[slotid];
				$('#list-' + slotid).remove();
			} else {
				course.slots = slots;
			}
			$(this).remove();
		} else {
			console.error('Slot name not found in slots array:', slotname);
		}
	
		updatePerma();
	});
	
	function getSlotColor(slotClass) {
		return '';
	}
	
    var lspl = getJsonFromUrl();
    if (lspl["data"] && lspl["data"].length > 0) {
        var courses2 = JSON.parse(decodeURIComponent(lspl["data"]));
        for (var i in courses2) {
            if (!courses2[i].color) {
                courses2[i].color = "rgba(255, 255, 0, 0.36)";
            }
            addCourse(courses2[i].name, courses2[i].slots.join(";"), courses2[i].venue, courses2[i].color);
        }
    }
    if (lspl["timetable"] && lspl["timetable"].length > 0) {
        var courses2 = JSON.parse(atob(decodeURIComponent(lspl["timetable"])));
        for (var i in courses2) {
            if (!courses2[i].color) {
                courses2[i].color = "rgba(255, 255, 0, 0.36)";
            }
            addCourse(courses2[i].name, courses2[i].slots.join(";"), courses2[i].venue, courses2[i].color);
        }
    }
    if (lspl["slots"] && lspl["slots"] == "false") {
        toggleSlot();
    }
    updatePerma();

    $('#helpicon').popover({ "title": "Separate multiple slots with a comma. <br>Slot groups like '4' also allowed", "trigger": "hover", "html": true, "placement": "bottom" });
    $('.structtd').html('<br><br>');
    $('.picker').colorpicker({ format: "rgba" }).on('changeColor', function(ev) {
        var ev_rgb = ev.color.toRGB();
        var alpha = ev_rgb.a;
        if (alpha === 1) { alpha = 0.36; }
        var ev_str = "rgba(" + ev_rgb.r + "," + ev_rgb.g + "," + alpha + ")";
        $("#color").val(ev_str);
    });
    $('.maintbl td').dblclick(function() {
        var $this = $(this);
        if ($("#cslots").val() == "") {
            $("#cslots").val($this.find("span").first().text());
        } else {
            var text = $("#cslots").val();
            text = text + "," + $this.find("span").first().text();
            $("#cslots").val(text);
        }
    });
});

function hideCrossButtons() {
    $('.remove-instance').hide();
}

function showCrossButtons() {
    $('.remove-instance').show();
}

function downloadAsImage() {
    hideCrossButtons();    
    var timetableElement = document.getElementById('table_final');
    var scale = 5;
    html2canvas(timetableElement, { scale: scale }).then(function(canvas) {
        var imgData = canvas.toDataURL('image/png');
        var downloadLink = document.createElement('a');
        downloadLink.href = imgData;
        downloadLink.download = 'timetable.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        showCrossButtons();
    });
}

function downloadAsPdf() {
    hideCrossButtons();    
    var tableElement = document.getElementById('table_final');
    html2pdf(tableElement, {
        margin: 10,
        filename: 'timetable.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 5 },
        jsPDF: { unit: 'pt', format: 'letter', orientation: 'portrait' }
    }).then(function() {
        console.log("PDF generated successfully");
		showCrossButtons();
    });
}
function openDatePicker() {
    var overlay = document.getElementById('overlay');
    overlay.style.display = (overlay.style.display === 'none' || overlay.style.display === '') ? 'flex' : 'none';
}
