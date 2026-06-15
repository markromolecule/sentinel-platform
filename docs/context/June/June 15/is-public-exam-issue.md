# Goal

- Issue encountered

- When the [creator] / [owner] of the [exam] has a [draft] / [published] [exam] and they set it on [private], the other users for e.g

administrators (admin or superadmin) creates an exam -> sets it as private -> the instructors still seeing the private exam. 

moreover, when the creator updates the [exam] to public, the [exam] on the instructors side is not reflecting on their side. 

take note that it has separate codebase
sentinel-core
sentinel-web

also, fix the exam card on sentinel-web it should be similar to the sentinel-core in addition for open question, what is the [draft] included under the assigned instructor?

in addition, can you ensure that the [message] page dynamically update the messages if. there's a new messages in that way user don't need to refresh the page to see the new messages. this is for all the codebase across sentinel

sentinel-support
sentinel-core
sentinel-web

implement a real-time update