package edu.eci.arsw.collabboard.domain.model;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public record Board(String id, String name, List<BoardElement> elements) {
 public Board {
   if(id==null || id.isBlank()) throw new IllegalArgumentException("Board id is required");
   if(name==null || name.isBlank()) throw new IllegalArgumentException("Board name is required");
   elements = elements == null ? List.of() : List.copyOf(elements);
   validateConnectors(elements);
 }
 private static void validateConnectors(List<BoardElement> elements){
   Set<String> ids=new HashSet<>();
   for(BoardElement e:elements){ if(!ids.add(e.id())) throw new IllegalArgumentException("Duplicate element id: "+e.id()); }
   for(BoardElement e:elements){
     if(e.type()==ElementType.CONNECTOR && (!ids.contains(e.sourceId()) || !ids.contains(e.targetId())))
       throw new IllegalArgumentException("Connector endpoints must reference existing elements");
   }
 }
}
