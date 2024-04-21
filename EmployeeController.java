package com.example.jhajeecodes.Employee.Management.System.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import org.springframework.jdbc.core.JdbcTemplate;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.nio.file.Files;

import com.example.jhajeecodes.Employee.Management.System.entity.Employee;
import com.example.jhajeecodes.Employee.Management.System.entity.FileDB;
import com.example.jhajeecodes.Employee.Management.System.entity.ResponseFile;
import com.example.jhajeecodes.Employee.Management.System.entity.ResponseMessage;
import com.example.jhajeecodes.Employee.Management.System.entity.Salary;
import com.example.jhajeecodes.Employee.Management.System.service.EmployeeService;
import com.example.jhajeecodes.Employee.Management.System.service.FileStorageService;

@Controller
@CrossOrigin("http://localhost:8080/employees")
@RequestMapping("/employees")
public class EmployeeController {

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private FileStorageService storageService;

	private EmployeeService employeeService;

	@Autowired
	public EmployeeController(EmployeeService employeeService) {
		this.employeeService = employeeService;

	}

	@GetMapping("/welcome")
	public String welcome() {

		return "welcome-page";
	}

	@GetMapping("/list")
	public String listEmployees(Model theModel) {

		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		System.out.println(auth.getPrincipal());

		List<Employee> theEmployees = employeeService.findAll();

		theModel.addAttribute("employees", theEmployees);
		return "list-employees";
	}

	@GetMapping("/showFormForAdd")
	public String showFormForAdd(Model theModel) {

		Employee theEmployee = new Employee();

		theModel.addAttribute("employee", theEmployee);
		theModel.addAttribute("salary", theEmployee.getSalary());

		return "employee-form";
	}

	@PostMapping("/showFormForUpdate")
	public String showFormForUpdate(@RequestParam("employeeId") int theId, Model theModel) {

		Employee theEmployee = employeeService.findById(theId);

		theModel.addAttribute("employee", theEmployee);
		theModel.addAttribute("salary", theEmployee.getSalary());

		System.out.println(theEmployee.getSalary());

		return "employee-form";
	}

//	
	@GetMapping("/showMoreDetails")
	public String showMoreDetails1(Model theModel) {
		List<Employee> theEmployees = employeeService.findAll();

		theModel.addAttribute("employees", theEmployees);
		return "employee-extra-details";
	}

	@PostMapping("/showMoreDetails")
	public String showMoreDetails(@RequestParam("employeeId") int theId, Model theModel) {

		Employee theEmployee = employeeService.findById(theId);

		theModel.addAttribute("employee", theEmployee);
		theModel.addAttribute("salary", theEmployee.getSalary());

		return "employee-extra-details";
	}

	@PostMapping("/save")
	public String saveEmployee(@ModelAttribute("employee") Employee theEmployee,
			@ModelAttribute("salary") Salary salary, Model theModel, @RequestParam("file") MultipartFile img)
			throws IOException {

		if (!img.isEmpty()) {
			try {

				File saveFile = new ClassPathResource("static/css").getFile();
				Path path = Paths.get(saveFile.getAbsolutePath() + File.separator + img.getOriginalFilename());
				System.out.println("----------------------------------------------------------" + path);
				Files.copy(img.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
				theEmployee.setImage(img.getOriginalFilename());
			} catch (Exception e) {
				e.printStackTrace();
			}
		}

		employeeService.save(theEmployee);
		return "redirect:/employees/list";
	}

	@PostMapping("/delete")
	public String delete(@RequestParam("employeeId") int theId, Model theModel) {
		employeeService.deleteById(theId);
		return "redirect:/employees/list";
	}

	@GetMapping("/test")
	public String test() {
		return "test";

	}

	@PostMapping("/upload")
	public ResponseEntity<ResponseMessage> uploadFile(@RequestParam("file") MultipartFile file) {
		
		String message = "";
		try {
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
				UserDetails userDetails = (UserDetails) authentication.getPrincipal();
				String fileName = file.getOriginalFilename();
				storageService.store(file);
				System.out.println("Received PDF for approval: " + fileName);
				System.out.println("User Role: " + userDetails.getAuthorities().toString());

			} else {
				System.out.println("Unauthorized Access");

			}

			message = "Uploaded the file successfully: " + file.getOriginalFilename();
			return ResponseEntity.status(HttpStatus.OK).body(new ResponseMessage(message));
		} catch (Exception e) {
			message = "Could not upload the file: " + file.getOriginalFilename() + "!";
			return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(new ResponseMessage(message));
		}
	}

//	@GetMapping("/files")
//	public ResponseEntity<List<ResponseFile>> getListFiles(Model model) {
//		List<ResponseFile> files = storageService.getAllFiles().map(dbFile -> {
//			String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath().path("/files/")
//					.path(dbFile.getId()).toUriString();
//
//			return new ResponseFile(dbFile.getName(), fileDownloadUri, dbFile.getType(), dbFile.getData().length);
//		}).collect(Collectors.toList());
//
//		model.addAttribute("pdfFiles", files);
//		
//		return ResponseEntity.status(HttpStatus.OK).body(files);
//	}
	
	@GetMapping("/files")
	public String getListFiles(Model model) {
	    List<ResponseFile> files = storageService.getAllFiles().map(dbFile -> {
	        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath().path("/files/")
	                .path(dbFile.getId()).toUriString();

	        return new ResponseFile(dbFile.getName(), fileDownloadUri, dbFile.getType(), dbFile.getData().length);
	    }).collect(Collectors.toList());

	    model.addAttribute("pdfFiles", files);

	    return "pdfFilesPage"; // pdfFilesPage is the name of your Thymeleaf template
	}
	


	@GetMapping("/files/{id}")
	public ResponseEntity<byte[]> getFile(@PathVariable String id) {
		FileDB fileDB = storageService.getFile(id);

		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileDB.getName() + "\"")
				.body(fileDB.getData());
	}

}
https://www.bezkoder.com/spring-boot-upload-file-database/
