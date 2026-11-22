import {eventDetails} from './event-details.js';
import {eventPhotos} from './event-photos.js';
import {days as originalDecember} from './december-base.js';
const categories={F:'Food & drink',N:'Animals & nature',P:'People & purpose',C:'Culture & traditions',Q:'Curious & creative'};
// Original editorial copy. The catalogue covers actual dates in 2026, not annual recurrence.
const rows=`
11-01|World Vegan Day|F|International · awareness|vegan|An occasion to explore plant-based food and the ideas behind vegan living.|Try a plant-based version of a favourite lunch.
11-01|Día de los Muertos begins|C|Mexico · 1–2 November|lights|A Mexican tradition remembering loved ones with ofrendas, flowers and favourite foods. Customs vary by community.|Learn what the different parts of an ofrenda mean.
11-01|All Saints’ Day|C|Christian observance|lights|A day honouring saints in several Christian traditions, with services and local customs.|Read about an All Saints tradition from another country.
11-01|National Cinnamon Day|F|US · informal|pastry|An unofficial celebration of the spice that makes a kitchen smell like a bakery.|Add cinnamon to a warm breakfast.
11-02|All Souls’ Day|C|Christian observance|lights|A day of prayer and remembrance for the departed in Catholic and some other Christian traditions.|Spend a quiet moment remembering someone important to you.
11-02|National Deviled Egg Day|F|US · informal|sandwich|An informal food day for filled eggs: a small snack with plenty of personality.|Try a different seasoning in an egg dish.
11-02|End Impunity for Crimes Against Journalists|P|United Nations|books|An international day supporting accountability for attacks on journalists and the right to report safely.|Read a report from an independent journalism organisation.
11-02|Colour the World Orange Day|P|International · awareness|autumn|An awareness day for complex regional pain syndrome, marked on the first Monday of November.|Listen to someone describing their experience of chronic pain.
11-03|National Sandwich Day|F|US · informal|sandwich|Bread, filling, repeat. An unofficial excuse to appreciate a dependable lunch format.|Upgrade one ingredient in your usual sandwich.
11-03|Culture Day|C|Japan · public holiday|books|Japan’s national holiday celebrating culture, the arts and academic achievement.|Explore a Japanese artist or museum collection.
11-03|World Jellyfish Day|N|International · informal|ocean|A moment for the drifting animals that make the sea look a little otherworldly.|Find out how jellyfish move without a brain.
11-03|One Health Day|P|International · awareness|forest|An awareness initiative connecting human, animal and environmental health.|Discover how people and wildlife share an ecosystem.
11-04|National Stress Awareness Day|P|UK · awareness|tea|An awareness day encouraging conversation about stress and the support people may need.|Give yourself a short, unhurried break.
11-04|National Candy Day|F|US · informal|sweets|An unofficial celebration of the sweet-shop counter and its colourful possibilities.|Choose a sweet you remember from childhood.
11-04|National Advent Calendar Day|Q|US · informal|lights|An early invitation to think about December’s little doors and daily surprises.|Plan a tiny advent surprise for someone.
11-04|Eating Healthy Day|F|US · awareness|vegan|A food-awareness day that can be as simple as adding variety to a meal.|Try a vegetable you do not usually buy.
11-05|Bonfire Night|C|UK · tradition|lights|Also called Guy Fawkes Night, this British tradition brings organised bonfires and firework displays on 5 November.|Find an organised local display.
11-05|World Tsunami Awareness Day|P|United Nations|ocean|An international day about understanding tsunami risks and helping communities prepare.|Learn what official coastal warning signs mean.
11-05|International Stout Day|F|International · informal|coffee|An informal nod to dark beer and the breweries making it.|Explore a stout, including alcohol-free options.
11-05|National Chinese Takeout Day|F|US · informal|vegan|An unofficial food day celebrating takeaway favourites in American food culture.|Try a different dish from a local restaurant.
11-06|National Nachos Day|F|US · informal|pizza|A convenient unofficial occasion for tortilla chips and generous toppings.|Make a sharing plate with a topping for everyone.
11-06|National Saxophone Day|Q|US · informal|music|A musical nod to the saxophone on inventor Adolphe Sax’s birthday.|Listen for the saxophone in a favourite track.
11-06|Fountain Pen Day|Q|International · informal|books|A first-Friday celebration of ink, handwriting and putting pen to paper.|Write a short note by hand.
11-06|Gumboot Friday|P|New Zealand · awareness|people|A New Zealand fundraising initiative supporting access to counselling for young people.|Learn about the charity’s work.
11-07|National Bison Day|N|US · observance|autumn|A first-Saturday observance appreciating bison and their place in North American ecosystems and cultures.|Learn about an Indigenous-led bison restoration project.
11-07|National Hug a Bear Day|Q|US · informal|dog|A light-hearted day for teddy bears and soft toys. Wild bears are excluded.|Give a much-loved soft toy a place of honour.
11-07|National Bittersweet Chocolate with Almonds Day|F|US · informal|chocolate|An extremely specific unofficial food day for dark chocolate and almonds.|Enjoy something nutty and chocolatey.
11-07|Kekri|C|Finland · contemporary celebration date|autumn|A Finnish harvest-season tradition associated with food and remembering ancestors. Local celebration dates vary.|Read about this tradition’s harvest roots.
11-08|Diwali|C|Hindu festival · 2026 main day|lights|A festival of light celebrated differently across communities. The main 2026 Diwali date is 8 November.|Learn about the lamps, stories and foods of Diwali.
11-08|Remembrance Sunday|P|UK & Commonwealth · remembrance|people|The second Sunday in November is a national moment of remembrance for those affected by conflict.|Observe a local act of remembrance if you wish.
11-08|National Cappuccino Day|F|US · informal|coffee|An informal occasion for espresso, warm milk and a particular cloud of foam.|Visit an independent café and linger.
11-08|National STEM/STEAM Day|Q|US · awareness|space|A day encouraging curiosity about science, technology, engineering, the arts and mathematics.|Try a small science or making project.
11-09|Go to an Art Museum Day|Q|International · informal|books|An invitation to give something someone made more than a passing glance.|Visit a gallery or explore a collection online.
11-09|Carl Sagan Day|Q|Informal · science appreciation|space|A celebration of the astronomer and science communicator on his birthday.|Watch a short film about the universe.
11-09|British Pudding Day|F|UK · informal|cupcake|An unofficial reason to appreciate the comforting end of a proper meal.|Try a traditional pudding you have never had.
11-09|World Freedom Day|P|US · observance|people|A US observance marking the fall of the Berlin Wall and reflecting on freedom.|Read a first-person account of Berlin in 1989.
11-10|World Science Day for Peace and Development|P|UNESCO|space|A day considering science’s contribution to communities and public participation in discovery.|Find a science project addressing a community problem.
11-10|Sesame Street Day|Q|US · informal|books|An informal celebration of the educational programme and its memorable characters.|Revisit a favourite musical moment from the show.
11-10|National Vanilla Cupcake Day|F|US · informal|cupcake|A small tribute to the deceptively simple vanilla cupcake.|Share a little cake with someone.
11-10|International Accounting Day|P|International · professional observance|books|A moment for the people turning piles of numbers into something that makes sense.|Thank someone who keeps the figures straight.
11-11|Armistice Day|P|UK & other countries · remembrance|people|Marking the armistice that ended fighting in the First World War, with remembrance at 11 am in many places.|Take a quiet moment for those affected by conflict.
11-11|World Origami Day|Q|International · informal|books|A day for turning a flat sheet of paper into something unexpected.|Fold a paper crane, boat or ambitious frog.
11-11|Singles’ Day|C|China · cultural & retail observance|celebration|A date associated with being single, later becoming a major Chinese shopping event.|Plan something enjoyable on your own terms.
11-11|National Sundae Day|F|US · informal|cupcake|An unofficial invitation to add a topping and perhaps another spoonful.|Make a small sundae with your favourite topping.
11-12|World Usability Day|Q|International · awareness|books|A day about making products and everyday systems easier for people to use.|Notice one thing that could be made simpler.
11-12|World Pneumonia Day|P|International · awareness|people|An awareness day focused on pneumonia and preventing avoidable illness and deaths.|Learn about a project improving access to care.
11-12|National Happy Hour Day|F|US · informal|tea|An unofficial excuse for a sociable pause. Company matters more than the glass’s contents.|Meet a friend for a drink, with or without alcohol.
11-12|National Pizza with the Works Except Anchovies Day|F|US · informal|pizza|A wonderfully specific unofficial food day for a generously topped pizza.|Let everyone pick one topping for a sharing pizza.
11-13|World Kindness Day|P|International · awareness|people|A reminder that ordinary kindness can change somebody’s day.|Do one small helpful thing without a fuss.
11-13|Children in Need|P|UK · 2026 appeal day|people|The BBC charity’s annual appeal supports children and young people across the UK.|Explore a fundraiser or a project the charity funds.
11-13|National Hug a Musician Day|Q|US · informal|music|An appreciation day for musicians. Hugs are optional; encouragement is excellent.|Tell a musician what their work means to you.
11-13|Symphonic Metal Day|Q|International · informal|music|A day for heavy guitars, orchestral arrangements and gloriously dramatic voices.|Try a symphonic metal band you do not know.
11-14|World Diabetes Day|P|United Nations · awareness|people|An international day about diabetes and access to appropriate care and support.|Read a reliable account of someone’s experience.
11-14|National Pickle Day|F|US · informal|vegan|A celebration of the jar doing serious work in the fridge door.|Try a pickle from a different food tradition.
11-14|National Seat Belt Day|P|US · awareness|plane|An awareness day highlighting seat belts’ role in road safety.|Make buckling up part of every car journey.
11-14|National Family PJ Day|Q|US · informal|tea|A low-effort occasion for comfortable clothes and spending time together.|Declare a pyjama-friendly film evening.
11-15|National Recycling Day|N|US · awareness|forest|Also associated with America Recycles Day, a prompt to understand local recycling.|Check one confusing item against council guidance.
11-15|Steve Irwin Day|N|International · conservation observance|autumn|Remembering the wildlife communicator and conservation work associated with his legacy.|Discover a threatened animal and its habitat.
11-15|National Bundt Day|F|US · informal|cupcake|An unofficial day for the ring-shaped cake that arrives already dressed up.|Bake, buy or share a slice.
11-15|National Philanthropy Day|P|International · observance|people|A day recognising giving, volunteering and support for community causes.|Support a cause in a practical way.
11-16|International Day for Tolerance|P|United Nations / UNESCO|people|A day about respect for different cultures, beliefs and ways of living.|Listen to someone whose experience differs from yours.
11-16|Odd Socks Day|P|UK · 2026 anti-bullying campaign|people|A colourful anti-bullying campaign celebrating difference. The 2026 campaign starts on this Monday.|Wear odd socks and make someone feel included.
11-16|National Fast Food Day|F|US · informal|sandwich|An unofficial nod to quick meals and familiar orders on busy days.|Try an independent version of a takeaway favourite.
11-16|Icelandic Language Day|C|Iceland · observance|mountain|A celebration of Icelandic on poet Jónas Hallgrímsson’s birthday.|Learn a short Icelandic phrase.
11-17|International Students’ Day|P|International · observance|books|Recognising students and the historical struggle for educational freedom.|Learn about a student-led community project.
11-17|National Take a Hike Day|N|US · informal|mountain|An invitation to spend time on a path, hill or longer route home.|Choose a walk matching your time and energy.
11-17|National Homemade Bread Day|F|US · informal|bread|A day for crusts, crumbs and the reassuring smell of a fresh loaf.|Visit an independent bakery or bake a loaf.
11-17|National Baklava Day|F|US · informal|pastry|A food day for layered pastry, nuts and syrup, with many regional variations.|Ask a local bakery about its baklava style.
11-18|Apple Cider Day|F|US · informal|tea|In the US, cider can mean an unfiltered, non-alcoholic apple drink. This informal day celebrates it.|Enjoy a warm spiced apple drink.
11-18|GIS Day|Q|International · professional observance|mountain|A day for geographic information systems: maps and data helping people understand places.|Explore an interactive map of somewhere familiar.
11-18|National Princess Day|Q|US · informal|lights|A playful day for fairy-tale energy and theatrical dressing up.|Give an ordinary task an unnecessary royal flourish.
11-18|World COPD Day|P|International · awareness|people|An annual day about chronic obstructive pulmonary disease and support for affected people.|Learn from a recognised respiratory health organisation.
11-19|International Men’s Day|P|International · awareness|people|An observance discussing men’s wellbeing, positive role models and community contributions.|Check in with a man you care about.
11-19|World Toilet Day|P|United Nations|ocean|A day highlighting sanitation and those still living without safe toilets.|Learn about a practical sanitation project.
11-19|Guinness World Records Day|Q|International · organised event|celebration|An occasion for record attempts and the impressively specific things humans can do.|Browse a record that makes you smile.
11-19|National Play Monopoly Day|Q|US · informal|cards|An invitation to negotiate over tiny properties and question the house rules.|Start a board game and agree the rules first.
11-20|World Children’s Day|P|United Nations|people|An international day centred on children’s rights and hearing children’s voices.|Explore a children’s rights project.
11-20|Transgender Day of Remembrance|P|International · remembrance|lights|A solemn day remembering transgender people lost to anti-transgender violence.|Listen respectfully and support a trusted community organisation.
11-20|National Peanut Butter Fudge Day|F|US · informal|chocolate|An unofficial food day for something rich and usually best in small squares.|Share a small sweet treat.
11-20|International Hug a Runner Day|Q|Informal observance|forest|A playful day for runners. Encouragement is an excellent alternative to an unsolicited hug.|Encourage someone working towards a running goal.
11-21|World Television Day|Q|United Nations|books|An observance of television’s role in communication and bringing stories to audiences.|Watch a documentary from another country.
11-21|World Hello Day|P|International · informal|people|A simple observance about greeting people and the value of peaceful communication.|Say hello to someone you usually hurry past.
11-21|National Gingerbread Cookie Day|F|US · informal|cookies|A reason to get ginger, spice and biscuit cutters out early.|Choose a gingerbread shape with maximum personality.
11-21|Family Volunteer Day|P|US · community observance|people|An occasion for generations to give time to their community together.|Find a small volunteer task to share.
11-22|Stir-Up Sunday|C|UK · tradition|pastry|The Sunday before Advent is traditionally associated with making Christmas pudding and stirring the mixture.|Look up a family pudding recipe.
11-22|Go For a Ride Day|Q|US · informal|autumn|An unofficial prompt to take a little journey for its own pleasure.|Try a scenic bus route, cycle path or drive.
11-22|Love Your Freckles Day|P|Informal observance|people|A light-hearted reminder to appreciate a feature making faces wonderfully individual.|Take a break from picking apart your appearance.
11-22|National Cranberry Relish Day|F|US · informal|pastry|A food day for the sharp accompaniment often found on Thanksgiving tables.|Try cranberry with a favourite savoury dish.
11-23|Doctor Who Day|Q|UK & international · fan observance|space|Marking the programme’s first broadcast in 1963: time travel, impossible boxes and favourite Doctors.|Watch a favourite episode or your first one.
11-23|National Espresso Day|F|US · informal|coffee|A celebration of a small cup with a big personality.|Try a café you have not visited.
11-23|Fibonacci Day|Q|Informal · mathematics|autumn|The US-style date 11/23 matches the sequence’s first four numbers: 1, 1, 2, 3.|Look for spirals and patterns in nature.
11-23|Thankful For My Dog Day|N|US · informal|dog|A very understandable occasion for appreciating a dog and their company.|Spend unhurried time with a dog you know.
11-24|Guru Nanak Gurpurab|C|Sikh observance · 2026|lights|The 2026 celebration of Guru Nanak’s birth, marked with prayer, service and shared food.|Learn about langar and community service.
11-24|National Fairy Bread Day|F|Australia & New Zealand · informal|cupcake|A celebration of buttered bread covered in colourful sprinkles: simple party nostalgia.|Learn this childhood favourite’s story.
11-24|Celebrate Your Unique Talent Day|Q|Informal observance|music|A day for your oddly specific skill, impressive or gloriously unnecessary.|Show someone a skill you rarely mention.
11-24|National Sardines Day|F|US · informal|ocean|A food day for a little fish with a place in many cuisines.|Explore a sardine dish from another food tradition.
11-25|End Violence Against Women Day|P|United Nations|people|An international day calling for an end to violence against women and girls.|Learn about an organisation supporting women locally.
11-24|Loy Krathong|C|Thailand · 2026 festival date|lights|A Thai festival associated with lights reflected on water. Local customs and dates can vary.|Explore stories from a Loy Krathong celebration.
11-25|National Jukebox Day|Q|US · informal|music|An appreciation day for machines turning spare change into a room’s soundtrack.|Make a tiny café jukebox playlist.
11-25|National Parfait Day|F|US · informal|cupcake|An unofficial excuse for dessert in layers, with whatever ceremony you fancy.|Layer fruit and yoghurt into a small glass.
11-26|Thanksgiving|C|United States · public holiday|people|The fourth Thursday in November is associated with gathering, gratitude and shared meals in the US.|Tell someone something specific you appreciate about them.
11-26|National Cake Day|F|US · informal|cupcake|An unofficial reminder that cake can make an ordinary day an occasion.|Share a slice with a friend.
11-26|World Sustainable Transport Day|N|United Nations|autumn|A day considering transport connecting people while reducing environmental impacts.|Try a short journey on foot, bike or public transport.
11-26|Good Grief Day|Q|US · informal|books|A nod to Peanuts creator Charles M. Schulz on his birthday.|Read a Peanuts strip and its little observation of life.
11-27|Black Friday|C|International · retail event|books|A shopping date after US Thanksgiving. Buying anything is entirely optional.|Decide what you need before opening a sale page.
11-27|Buy Nothing Day|N|International · campaign|forest|A campaign inviting a pause from shopping and reflection on consumption.|Repair, borrow or reuse something.
11-27|Lancashire Day|C|England · county observance|autumn|A day celebrating Lancashire’s history, communities and regional identity.|Explore a Lancashire dish or place.
11-27|National Illustration Day|Q|UK · creative observance|books|An occasion to notice the artists bringing stories and everyday objects to life.|Follow an illustrator who makes you stop scrolling.
11-28|Small Business Saturday|P|US · organised observance|people|The US Saturday after Thanksgiving supports independents. The UK event has a different date.|Visit an independent shop or leave a useful review.
11-28|National French Toast Day|F|US · informal|bread|An occasion for the breakfast giving yesterday’s bread a good second act.|Make a sweet or savoury French toast breakfast.
11-28|Red Planet Day|Q|US · informal|space|A space-themed observance associated with Mariner 4’s launch and our fascination with Mars.|Explore an image of the Martian surface.
11-28|Albanian Independence Day|C|Albania · public holiday|celebration|Marking Albania’s declaration of independence in 1912, at home and among diaspora communities.|Discover an Albanian artist or tradition.
11-29|First Sunday of Advent|C|Christian observance · 2026|lights|The start of Advent in many Western Christian traditions: preparation before Christmas.|Learn about an Advent wreath’s symbolism.
11-29|International Jaguar Day|N|International · conservation|autumn|Highlighting jaguars and the connected habitats they need across the Americas.|Find out about jaguar corridor conservation.
11-29|National Chocolates Day|F|US · informal|chocolate|An unofficial occasion for the assorted box and choosing a favourite.|Try a flavour you normally leave until last.
11-29|Secondhand Sunday|N|Informal · reuse campaign|books|A shopping-season prompt to give objects another life instead of always buying new.|Browse a charity shop or pass something on.
11-30|St Andrew’s Day|C|Scotland · bank holiday|mountain|Scotland’s national day celebrates its patron saint, culture and communities.|Explore a Scottish musician or tradition.
11-30|National Computer Security Day|Q|US · awareness|books|A reminder of the ordinary habits helping keep digital life secure.|Check an important account has two-step verification.
11-30|National Mousse Day|F|US · informal|chocolate|An unofficial food day for a dessert turning air into something rather elegant.|Choose a little pot of your favourite mousse.
11-30|National Personal Space Day|P|US · informal|people|A reminder that comfortable boundaries differ and deserve respect.|Ask before offering a hug.
12-01|World AIDS Day|P|International · awareness|people|A day of solidarity with people living with HIV and remembrance of those lost to AIDS-related illness.|Learn from a trusted HIV organisation and challenge stigma.
12-01|National Eat a Red Apple Day|F|US · informal|vegan|An unofficial day with an uncomplicated suggestion: appreciate a red apple.|Try a different apple variety.
12-02|International Day for the Abolition of Slavery|P|United Nations|people|Calling attention to modern slavery and efforts to end exploitation.|Learn how an anti-slavery organisation supports people.
12-02|World Computer Literacy Day|Q|International · awareness|books|Considering digital skills that help people participate in work and everyday life.|Help someone with a frustrating computer task.
12-03|Celebrate Shelter Pets Day|N|US · awareness|dog|An occasion for shelter animals and the people finding them suitable homes.|Share a reputable local rescue’s appeal.
12-03|Make a Gift Day|Q|US · informal|books|An unofficial prompt for a present with thought and time folded into it.|Make a bookmark, note or tiny gift.
12-04|Hanukkah begins at sundown|C|Jewish observance · 4–12 December 2026|lights|The eight-night festival begins at sundown on 4 December and ends at nightfall on 12 December. Only the start is listed.|Learn about the hanukkiah and the festival’s story.
12-04|International Cheetah Day|N|International · conservation|autumn|Highlighting cheetahs, their habitats and conservation challenges.|Discover how conservation works alongside local communities.
12-04|National Sock Day|Q|US · informal|people|A moment for matching pairs, odd pairs and the one that vanished.|Wear your least boring socks.
12-05|World Soil Day|N|United Nations / FAO|forest|An observance of soil supporting food systems, biodiversity and life on land.|Discover what healthy soil contains.
12-05|Krampusnacht|C|Alpine Europe · tradition|lights|The night before Saint Nicholas Day has a frightening companion in parts of Alpine Europe.|Read about the regional folklore behind Krampus.
12-06|National Gazpacho Day|F|US · informal|vegan|A US food day for chilled Spanish soup, despite December’s unexpected timing.|Explore gazpacho’s regional variations.
12-06|Mitten Tree Day|P|US · informal|people|An occasion associated with collecting warm clothing for those who need it.|Ask a charity whether it needs winter clothing.
12-07|National Letter Writing Day|Q|US · informal|books|An invitation to put an actual message on actual paper.|Write a letter to someone who would enjoy it.
12-07|National Cotton Candy Day|F|US · informal|sweets|A day for spun sugar and the memory of a fairground.|Share a favourite fairground memory.
12-08|Bodhi Day|C|Some Buddhist traditions|lights|An observance of the Buddha’s enlightenment. Dates and customs differ across Buddhist traditions.|Learn how a Buddhist community marks it.
12-08|Pretend to Be a Time Traveler Day|Q|US · informal|space|An unofficial excuse to find this century a slightly confusing stopover.|Write a postcard as a visitor from the future.
12-09|National Pastry Day|F|US · informal|pastry|An appreciation day for the beautifully layered thing in the bakery window.|Choose a pastry you have not tried.
12-09|Christmas Card Day|Q|Informal observance|books|A nudge to send a greeting before the post becomes frantic.|Write a card with a personal message.
12-10|Christmas Jumper Day|P|UK · Save the Children campaign|people|A fundraising day for festive jumpers and Save the Children’s work. The 2026 date is 10 December.|Wear or decorate a jumper and support the campaign.
12-10|International Animal Rights Day|N|International · campaign|dog|An awareness day about animal treatment and people’s responsibilities towards animals.|Learn about a reputable animal welfare organisation.
12-11|National Tango Day|C|Argentina · observance|music|Celebrating tango’s music, dance and cultural history.|Listen to a recording or watch a performance.
12-11|National Have a Bagel Day|F|US · informal|bread|An occasion for a chewy favourite and the filling you always return to.|Try an independent bakery’s bagel.
12-12|Gingerbread House Day|Q|US · informal|cookies|An invitation to build something ambitious from biscuits and icing.|Make a tiny gingerbread house, even if the roof has opinions.
12-12|Universal Health Coverage Day|P|United Nations|people|Advocating access to needed health services without financial hardship.|Learn about a project improving access to care.
12-13|Saint Lucia’s Day|C|Nordic countries & other communities|lights|A feast associated with candlelit processions and winter light, especially in Sweden.|Explore a Lucia song or the saffron buns.
12-13|World Choral Day|Q|International · music observance|music|An occasion for voices together and communities built around choral singing.|Listen to a choir from another tradition.
12-14|Roast Chestnuts Day|F|US · informal|pastry|A seasonal nod to warm chestnuts and winter street stalls.|Try roasted chestnuts at a seasonal stall.
12-14|National Bouillabaisse Day|F|US · informal|ocean|An informal US food day for the Provençal fish soup.|Read about bouillabaisse’s Marseille roots.
12-15|Bill of Rights Day|P|United States · observance|books|Marking the ratification of the US Constitution’s first ten amendments in 1791.|Read an amendment and its historical context.
12-15|National Cat Herders Day|Q|US · informal|dog|Appreciating people coordinating a group with entirely different plans.|Thank your group’s practical organiser.
12-16|Day of Reconciliation|P|South Africa · public holiday|people|A public holiday focused on reconciliation, unity and South Africa’s complex history.|Read a South African perspective on reconciliation.
12-16|Las Posadas begins|C|Mexico & other communities · 16–24 December|lights|Nine nights recalling the search for lodging, with processions and gatherings. Only the beginning is listed.|Learn the songs and customs of a Posadas celebration.
12-17|Wright Brothers Day|Q|United States · observance|plane|Remembering powered flight in 1903 and the curiosity behind early aviation.|Explore a photograph of the first flights.
12-17|National Re-Gifting Day|Q|US · informal|books|An occasion to pass an unused item thoughtfully to someone who might love it.|Find an unused item that would make someone happy.
12-18|Arabic Language Day|C|United Nations / UNESCO|books|Celebrating Arabic and its contributions to culture, knowledge and communication.|Learn a greeting in Arabic.
12-18|National Ugly Christmas Sweater Day|Q|US · informal|people|The third Friday in December embraces maximum festive knitwear.|Wear something cheerfully over the top.
12-19|National Emo Day|Q|US · informal|music|A nod to emotional lyrics and the hairstyle with its own gravitational field.|Play a song from your teenage years.
12-19|Look for an Evergreen Day|N|US · informal|forest|A seasonal prompt to notice trees keeping their foliage through winter.|Learn to recognise a local evergreen.
12-20|Go Caroling Day|Q|US · informal|music|An invitation to sing seasonal songs with other people, beautifully or otherwise.|Join a singalong or play a favourite carol.
12-20|Games Day|Q|Informal observance|cards|A day for the pleasure of playing something together.|Bring out a game that needs no screen.
12-21|World Meditation Day|P|United Nations|forest|An observance highlighting meditation and opportunities to learn about its different practices.|Try a short, comfortable moment of quiet attention.
12-21|National Short Story Day|Q|UK · informal|books|A short-story celebration associated with the Northern Hemisphere’s shortest day.|Read one short story from beginning to end.
12-21|World Basketball Day|Q|United Nations|people|An observance of basketball’s role in participation and community.|Watch a game or practise a few shots.
12-22|National Mathematics Day|Q|India · observance|books|India’s observance on Srinivasa Ramanujan’s birthday celebrates mathematical discovery.|Learn a surprising fact about Ramanujan’s work.
12-22|National Cookie Exchange Day|F|US · informal|cookies|An excuse to swap biscuits and discover another family favourite.|Trade a small batch with a friend.
12-23|Christmas Movie Marathon Day|Q|US · informal|lights|A day for familiar films and the soundtrack you know by heart.|Pick a festive film and make an evening of it.
12-23|Night of the Radishes|C|Oaxaca, Mexico · tradition|vegan|An Oaxacan tradition featuring elaborate scenes carved from radishes.|Explore photographs of the detailed carvings.
12-24|Christmas Book Flood|C|Iceland · Christmas Eve tradition|books|Jólabókaflóð is associated with giving books and reading on Christmas Eve.|Give or borrow a book and start the first chapter.
12-24|National Eggnog Day|F|US · informal|cocoa|A food day for the creamy festive drink, with alcoholic and alcohol-free versions.|Enjoy a festive drink your way.
12-25|National Pumpkin Pie Day|F|US · informal|pastry|An unofficial food day for a spiced pie on many American festive tables.|Share a slice of pie.
12-25|A’Phabet Day / No “L” Day|Q|US · informal wordplay|books|An unofficial pun on Noel: a Christmas word game with the letter L missing.|Write a sentence without the letter L.
12-26|Boxing Day|C|UK & several Commonwealth countries|people|Traditions include visiting, sport, walks and leftovers. The UK substitute bank holiday is 28 December in 2026.|Take a relaxed walk or catch up with someone.
12-26|National Thank You Note Day|P|US · informal|books|A reminder that a specific thank-you can mean more than a quick reaction.|Write someone a short, personal thank-you.
12-26|Saint Stephen’s Day|C|Christian observance · several countries|lights|A Christian feast with different local customs, including Wren Day in parts of Ireland.|Discover a Saint Stephen’s Day custom.
12-27|International Day of Epidemic Preparedness|P|United Nations|people|Highlighting preparedness, public health systems and international cooperation.|Learn how public health organisations plan for outbreaks.
12-27|Make Cut-Out Snowflakes Day|Q|US · informal|books|Fold some paper and discover what the scissors have decided to make.|Cut a paper snowflake and unfold the surprise.
12-28|Boxing Day bank holiday (substitute)|C|UK · bank holiday in 2026|lights|With 26 December on a Saturday in 2026, the UK bank holiday is Monday 28 December.|Enjoy some breathing room if you have the day off.
12-28|National Call a Friend Day|P|US · informal|people|A prompt to turn “we must catch up” into a conversation.|Call a friend you have been meaning to contact.
12-29|International Cello Day|Q|International · informal|music|A celebration of the cello on Pablo Casals’s birthday.|Listen to a piece putting cello centre stage.
12-29|National Pepper Pot Day|F|US · informal|vegan|A US food day associated with pepper pot soup and its varied history.|Explore the people and cuisines behind a traditional soup.
12-30|National Resolution Planning Day|Q|US · informal|books|Think about next year before the clock starts making it feel urgent.|Choose a small habit you want to make easier.
12-30|Falling Needles Family Fest Day|Q|US · informal|forest|A tongue-in-cheek occasion for a real Christmas tree redecorating the floor.|Make seasonal tidying a shared task.
12-31|Hogmanay|C|Scotland · New Year tradition|celebration|Scotland’s New Year celebrations bring music and traditions such as first-footing.|Learn where a Hogmanay custom comes from.
12-31|National Champagne Day|F|US · informal|celebration|A conveniently timed food-and-drink day. Alcohol-free bubbles are welcome too.|Raise a glass to something you want to remember.
`.trim().split('\n');
const palette=['#d9caff','#d5ef8a','#ffbba7','#ffd96b','#b6e5e4'];
const sources={
  'Hanukkah begins at sundown':'https://www.hebcal.com/holidays/chanukah-2026',
  'Diwali':'https://www.hcilondon.gov.in/page/list-of-the-holidays/',
  'Guru Nanak Gurpurab':'https://www.hcilondon.gov.in/page/list-of-the-holidays/',
  'St Andrew’s Day':'https://www.gov.uk/bank-holidays',
  'Boxing Day bank holiday (substitute)':'https://www.gov.uk/bank-holidays',
  'Remembrance Sunday':'https://www.britishlegion.org.uk/get-involved/events/remembrance-events/remembrance-sunday',
  'Loy Krathong':'https://www.thailand.go.th/public/useful-information-detail/celebrate-loy-krathong-across-thailand-on-24-november-under-the-full-moon',
  'Odd Socks Day':'https://anti-bullyingalliance.org.uk/anti-bullying-week-2026/odd-socks-day',
  'Children in Need':'https://www.bbcchildreninneed.co.uk/schools/faq/',
  'Christmas Jumper Day':'https://www.savethechildren.org.uk/christmas-jumper-day/about/faq',
  'Winter Solstice':'https://www.timeanddate.com/holidays/seasons/december-solstice'
};
const slug=value=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const imageOverrides={'Diwali':'diwali','Hanukkah begins at sundown':'hanukkah','International Cheetah Day':'cheetah','Bonfire Night':'bonfire'};
const extra=rows.map((line,index)=>{
  const [shortDate,title,category,scope,image,description,idea]=line.split('|');
  const date=`2026-${shortDate}`;
  return {id:`${date}:${slug(title)}`,date,day:Number(shortDate.slice(3)),month:date.slice(0,7),title,category:categories[category],scope,image:`./assets/${imageOverrides[title]||image}.jpg`,description,idea,tagline:idea,color:palette[index%palette.length],source:sources[title]||`https://www.daysoftheyear.com/days/${shortDate.startsWith('11')?'nov':'dec'}/${shortDate.slice(3)}/2026/`,verifiedOn:'2026-11-22'};
});
// Keep the December prototype IDs so existing bookmarks continue to work.
const old=originalDecember.map(event=>({...event,date:event.id,month:'2026-12',source:sources[event.title]||event.source,verifiedOn:'2026-11-22'}));
export const events=[...old,...extra].map(event=>{
  const details=eventDetails[event.id],photo=eventPhotos[event.id],date=details?.date||event.date;
  return {...event,date,day:Number(date.slice(8)),month:date.slice(0,7),title:details?.title||event.title,aliases:details?.title&&details.title!==event.title?[event.title]:[],scope:event.title==='Kekri'?'Finland · harvest season; local dates vary':event.scope,description:details?.summary||event.description,idea:details?.activity?.text||event.idea,details,source:details?.sources?.find(source=>source.dateEvidence)?.url||details?.sources?.[0]?.url||event.source,...(photo?{image:photo.image,imageAlt:photo.alt,photoCredit:photo.credit}:{})};
}).filter(event=>['2026-11','2026-12'].includes(event.month)).sort((a,b)=>a.date.localeCompare(b.date));
export const days=[...new Set(events.map(event=>event.date))].sort().map(date=>({id:date,date,day:Number(date.slice(8)),month:date.slice(0,7),events:events.filter(event=>event.date===date)}));
export const months=['2026-11','2026-12'];
export const byId=id=>events.find(event=>event.id===id);
export const byDate=date=>days.find(day=>day.date===date);
export const monthDays=month=>days.filter(day=>day.month===month);
export function dateLabel(value,options={day:'numeric',month:'long'}) {
  const date=typeof value==='string'?value:value.date||value.id;
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-GB',options);
}
