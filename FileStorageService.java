package com.example.jhajeecodes.Employee.Management.System.service;

import java.io.IOException;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.example.jhajeecodes.Employee.Management.System.entity.FileDB;
import com.example.jhajeecodes.Employee.Management.System.repository.FileDBRepository;

@Service
public class FileStorageService {

  @Autowired
  private FileDBRepository fileDBRepository;

  public FileDB store(MultipartFile file) throws IOException {
    String fileName = StringUtils.cleanPath(file.getOriginalFilename());
    
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String userRole = authentication.getAuthorities().iterator().next().getAuthority();
    FileDB FileDB = new FileDB(fileName, file.getContentType(), file.getBytes(),userRole);

    return fileDBRepository.save(FileDB);
  }

  public FileDB getFile(String id) {
    return fileDBRepository.findById(id).get();
  }
  
  public Stream<FileDB> getAllFiles() {
    return fileDBRepository.findAll().stream();
  }
}