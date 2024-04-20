package com.example.jhajeecodes.Employee.Management.System.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.jhajeecodes.Employee.Management.System.entity.FileDB;

@Repository
public interface FileDBRepository extends JpaRepository<FileDB, String> {

}