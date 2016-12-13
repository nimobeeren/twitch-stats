// Set the word counter to 0
function resetCounter(){
	$('#count').html(0);
	oldCount = 0; // Keeps frequency from going wild
}

// Clears table, adding rows until there are at least numRows in its tbody
function clearTable(numRows){
	// Get tbody element
	var tbody = $('#common-words-table tbody');

	// Add rows until there are at least numRows
	while(tbody.children('tr').length < numRows){
		tbody.append('<tr><td></td><td></td></tr>');
	}

	// Empty all table data cells
	tbody.find('td').text('-');
}

// Add words to recentWords array, together with the time they were added
function addWords(words){
	// Get current time
	var date = new Date();
	var now = date.getTime();

	for(i = 0; i < words.length; i++){
		// Increment keyword counter if word matches
		if(words[i].toLowerCase() == $('#keyword').val().toLowerCase()){
			var count = parseInt($('#count').html());
			$('#count').html(count + 1);
		}

		// Check if word is already in recentWords
		var found = false;
		for(j = 0; j < recentWords.length; j++){
			// If word is already in recentWords, only add the current time to the existing entry
			if(recentWords[j].word.toLowerCase() == words[i].toLowerCase()){
				found = true;
				recentWords[j].times.push(now);
				recentWords[j].count = recentWords[j].times.length; // Updates count, may be obsolete
				break;
			}
		}
		if(!found){
			// Add the new word to recentWords
			recentWords.push({
				word: words[i],
				times: [now],
				count: 1
			});
		}
	}
}

// Catch messages from selected channel
socket.on('chatMessage', function(from, to, message){
	console.log(message);

	// Split message up into individual words
	var words = message.split(' ');
	
	// Add words from message to recentWords
	addWords(words);
});

// Every updateTime, display the maxWords most common words and their count in the table
setInterval(function(){
	// Remove all data from table
	clearTable();

	// Sort recent words by count
	sortedWords = recentWords;
	sortedWords.sort(function(a, b){
		return b.count - a.count;
	})

	// Get the tbody element
	var tbody = $('#common-words-table tbody');

	// Add the maxWords most common words and their count to the table
	// Don't try to add more words than there are in recentWords
	for(i = 0; i < maxWords && i < sortedWords.length; i++){
		// Try to get an emote that matches this word
		var emote = getEmoteByName(sortedWords[i].word)[0];

		if(emote){
			// Set table cell content to emote image instead of text
			// TODO: Should probably only do this once for each image, or does the browser handle it?
			// It probably does...
			var url = 'https://static-cdn.jtvnw.net/emoticons/v1/' + emote.id + '/1.0';
			tbody.children('tr').eq(i).children('td').eq(0).html('<img src="' + url + '">'); // TODO: Tidy up with jQuery
		} else {
			// Set table cell content to the regular word
			tbody.children('tr').eq(i).children('td').eq(0).text(sortedWords[i].word);
		}

		// Set the count for the current word in the table
		tbody.children('tr').eq(i).children('td').eq(1).text(sortedWords[i].count);
	}
}, updateTime);

// Every updateTime, remove word times that are over maxWordAge old
setInterval(function(){
	// Get current time
	var date = new Date();
	var now = date.getTime();

	// Remove word times if they are over maxWordAge old
	for(i = 0; i < recentWords.length; i++){
		while(now - recentWords[i].times[0] > maxWordAge){
			recentWords[i].times.shift();
		}
		recentWords[i].count = recentWords[i].times.length; // Update count after removing old times
		// If word count is 0, remove it from recentWords
		if(recentWords[i].count == 0){
			recentWords.splice(i, 1);
		}
	}
}, updateTime);

// Every second, calculate the frequency of the keyword
var oldCount = 0;
var newCount;
var dt = 1000;
setInterval(function(){
	newCount = $("#count").html();
	dCount = newCount - oldCount;
	freq = dCount / dt * 1000; // In words/s
	$('#freq').html(freq);
	oldCount = newCount;
}, dt);

// Fill table to have space for 10 words
clearTable(maxWords);
